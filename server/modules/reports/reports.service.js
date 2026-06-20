import Appointment from '../../models/Appointment.model.js';
import Doctor from '../../models/Doctor.model.js';
import Department from '../../models/Department.model.js';
import LabResult from '../../models/LabResult.model.js';
import EHR from '../../models/EHR.model.js';
import DischargeSummary from '../../models/DischargeSummary.model.js';
import MedicalCertificate from '../../models/MedicalCertificate.model.js';

// Read-only aggregation endpoints — every report reuses the same models
// already queried elsewhere (chief-doctor dashboard, admin dashboard) rather
// than introducing a parallel reporting data store.

const paginate = ({ page = 1, limit = 20 } = {}) => {
  const pg  = Math.max(1, Number(page) || 1);
  const lim = Math.min(100, Math.max(1, Number(limit) || 20));
  return { pg, lim, skip: (pg - 1) * lim };
};

const dateRange = ({ dateFrom, dateTo } = {}, field = 'date') => {
  if (!dateFrom && !dateTo) return {};
  const range = {};
  if (dateFrom) range.$gte = new Date(dateFrom);
  if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59, 999); range.$lte = end; }
  return { [field]: range };
};

const doctorPopulate = { path: 'doctorId', populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization departmentId' };
const patientPopulate = { path: 'patientId', populate: { path: 'userId', select: 'fullName' }, select: 'userId' };

// Resolves a departmentId filter into a set of doctorIds — appointments
// don't store departmentId directly, only via the doctor relation.
const resolveDoctorFilter = async ({ doctorId, departmentId }) => {
  if (doctorId) return doctorId;
  if (departmentId) {
    const ids = await Doctor.find({ departmentId }).distinct('_id');
    return { $in: ids };
  }
  return undefined;
};

// ─── Summary (overview cards) ─────────────────────────────────────────────────

export const getSummary = async (query) => {
  const dq = dateRange(query, 'date');
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const [
    totalAppointments, completed, cancelled, missed,
    pendingDocuments, overdueAppointments, criticalLabResults, averageLabApprovalHours,
  ] = await Promise.all([
    Appointment.countDocuments({ ...dq }),
    Appointment.countDocuments({ ...dq, status: 'completed' }),
    Appointment.countDocuments({ ...dq, status: 'cancelled' }),
    Appointment.countDocuments({ ...dq, status: 'missed' }),
    Promise.all([
      EHR.countDocuments({ approvalStatus: 'submitted', isActive: true }),
      DischargeSummary.countDocuments({ approvalStatus: 'submitted' }),
      MedicalCertificate.countDocuments({ approvalStatus: 'submitted' }),
    ]).then((v) => v.reduce((a, b) => a + b, 0)),
    Appointment.countDocuments({ date: { $lt: todayStart }, status: 'scheduled' }),
    LabResult.countDocuments({ status: 'completed', results: { $elemMatch: { status: 'critical' } } }),
    LabResult.aggregate([
      { $match: { completedAt: { $ne: null }, ...dateRange(query, 'completedAt') } },
      { $project: { hours: { $divide: [{ $subtract: [{ $ifNull: ['$approvedAt', new Date()] }, '$completedAt'] }, 3600000] } } },
      { $group: { _id: null, averageHours: { $avg: '$hours' } } },
    ]),
  ]);

  return {
    totalAppointments, completed, cancelled, missed,
    pendingDocuments, overdueAppointments, criticalLabResults,
    averageLabApprovalHours: +(averageLabApprovalHours[0]?.averageHours || 0).toFixed(1),
  };
};

// ─── Appointments report ───────────────────────────────────────────────────────

export const getAppointmentsReport = async (query) => {
  const filter = { ...dateRange(query, 'date') };
  if (query.status) filter.status = query.status;
  const doctorFilter = await resolveDoctorFilter(query);
  if (doctorFilter !== undefined) filter.doctorId = doctorFilter;

  const [byStatus, byDoctorAgg] = await Promise.all([
    Appointment.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Appointment.aggregate([
      { $match: filter },
      { $group: { _id: '$doctorId', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }, missed: { $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
      { $limit: 50 },
    ]),
  ]);

  const doctors = await Doctor.find({ _id: { $in: byDoctorAgg.map((d) => d._id) } })
    .populate('userId', 'fullName').populate('departmentId', 'name').select('userId departmentId specialization');
  const doctorMap = Object.fromEntries(doctors.map((d) => [String(d._id), d]));
  const byDoctor = byDoctorAgg.map((d) => ({ ...d, doctor: doctorMap[String(d._id)] || null }));

  const byDepartment = {};
  for (const row of byDoctor) {
    const deptName = row.doctor?.departmentId?.name || 'Unknown';
    byDepartment[deptName] = byDepartment[deptName] || { department: deptName, total: 0, completed: 0, cancelled: 0, missed: 0 };
    byDepartment[deptName].total += row.total;
    byDepartment[deptName].completed += row.completed;
    byDepartment[deptName].cancelled += row.cancelled;
    byDepartment[deptName].missed += row.missed;
  }

  const result = { byStatus, byDoctor, byDepartment: Object.values(byDepartment) };

  if (query.detail === 'true' || query.detail === true) {
    const { pg, lim, skip } = paginate(query);
    const [items, total] = await Promise.all([
      Appointment.find(filter).populate(patientPopulate).populate(doctorPopulate).sort({ date: -1, startTime: 1 }).skip(skip).limit(lim),
      Appointment.countDocuments(filter),
    ]);
    result.detail = { items, total, page: pg, limit: lim };
  }

  return result;
};

// ─── Lab report ────────────────────────────────────────────────────────────────

export const getLabReport = async (query) => {
  const filter = { ...dateRange(query, 'createdAt') };
  if (query.status) filter.status = query.status;

  const [byStatus, avgAgg] = await Promise.all([
    LabResult.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    LabResult.aggregate([
      { $match: { completedAt: { $ne: null }, ...dateRange(query, 'completedAt') } },
      { $project: { hours: { $divide: [{ $subtract: [{ $ifNull: ['$approvedAt', new Date()] }, '$completedAt'] }, 3600000] } } },
      { $group: { _id: null, averageHours: { $avg: '$hours' } } },
    ]),
  ]);

  const result = { byStatus, averageApprovalHours: +(avgAgg[0]?.averageHours || 0).toFixed(1) };

  if (query.detail === 'true' || query.detail === true) {
    const { pg, lim, skip } = paginate(query);
    const [items, total] = await Promise.all([
      LabResult.find(filter).populate(patientPopulate).sort({ createdAt: -1 }).skip(skip).limit(lim)
        .select('protocolNo testName status patientFullName completedAt approvedAt createdAt patientId'),
      LabResult.countDocuments(filter),
    ]);
    result.detail = { items, total, page: pg, limit: lim };
  }

  return result;
};

// ─── Medical document approval report ─────────────────────────────────────────

const documentModels = { ehr: EHR, discharge: DischargeSummary, certificate: MedicalCertificate };

export const getDocumentsReport = async (query) => {
  const filter = { ...dateRange(query, 'createdAt') };
  if (query.status) filter.approvalStatus = query.status;

  const [ehrByStatus, dischargeByStatus, certByStatus] = await Promise.all([
    EHR.aggregate([{ $match: { ...filter, isActive: true } }, { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }]),
    DischargeSummary.aggregate([{ $match: filter }, { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }]),
    MedicalCertificate.aggregate([{ $match: filter }, { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }]),
  ]);

  const merged = {};
  for (const [kind, rows] of [['ehr', ehrByStatus], ['discharge', dischargeByStatus], ['certificate', certByStatus]]) {
    for (const row of rows) {
      merged[row._id] = merged[row._id] || { status: row._id, total: 0, ehr: 0, discharge: 0, certificate: 0 };
      merged[row._id].total += row.count;
      merged[row._id][kind] += row.count;
    }
  }

  const result = { byStatus: Object.values(merged) };

  const kind = query.kind && documentModels[query.kind] ? query.kind : null;
  if ((query.detail === 'true' || query.detail === true) && kind) {
    const Model = documentModels[kind];
    const { pg, lim, skip } = paginate(query);
    const docFilter = kind === 'ehr' ? { ...filter, isActive: true } : filter;
    const [items, total] = await Promise.all([
      Model.find(docFilter).populate(patientPopulate).sort({ createdAt: -1 }).skip(skip).limit(lim),
      Model.countDocuments(docFilter),
    ]);
    result.detail = { kind, items, total, page: pg, limit: lim };
  }

  return result;
};

// ─── Doctor activity summary ───────────────────────────────────────────────────

export const getDoctorActivityReport = async (query) => {
  const filter = { ...dateRange(query, 'date') };
  const doctorFilter = await resolveDoctorFilter(query);
  if (doctorFilter !== undefined) filter.doctorId = doctorFilter;

  const { pg, lim, skip } = paginate(query);

  const agg = await Appointment.aggregate([
    { $match: filter },
    { $group: { _id: '$doctorId', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }, missed: { $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] } } } },
    { $sort: { total: -1 } },
    { $skip: skip },
    { $limit: lim },
  ]);
  const total = (await Appointment.aggregate([{ $match: filter }, { $group: { _id: '$doctorId' } }])).length;

  const doctors = await Doctor.find({ _id: { $in: agg.map((d) => d._id) } })
    .populate('userId', 'fullName').populate('departmentId', 'name').select('userId departmentId specialization');
  const doctorMap = Object.fromEntries(doctors.map((d) => [String(d._id), d]));

  const items = agg.map((row) => ({
    ...row,
    completionRate: row.total > 0 ? +((row.completed / row.total) * 100).toFixed(1) : 0,
    doctor: doctorMap[String(row._id)] || null,
  }));

  return { items, total, page: pg, limit: lim };
};

// ─── Department activity summary ───────────────────────────────────────────────

export const getDepartmentActivityReport = async (query) => {
  const filter = { ...dateRange(query, 'date') };

  const [agg, departments, doctorCounts] = await Promise.all([
    Appointment.aggregate([
      { $match: filter },
      { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { $group: { _id: '$doctor.departmentId', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }, missed: { $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] } } } },
    ]),
    Department.find().select('_id name'),
    Doctor.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$departmentId', count: { $sum: 1 } } }]),
  ]);

  const deptMap = Object.fromEntries(departments.map((d) => [String(d._id), d.name]));
  const doctorCountMap = Object.fromEntries(doctorCounts.map((d) => [String(d._id), d.count]));

  const items = agg.map((row) => ({
    departmentId: row._id,
    departmentName: deptMap[String(row._id)] || 'Unknown',
    total: row.total,
    completed: row.completed,
    cancelled: row.cancelled,
    missed: row.missed,
    activeDoctors: doctorCountMap[String(row._id)] || 0,
  }));

  return { items };
};
