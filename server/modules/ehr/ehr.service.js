import MedicalRecord from '../../models/MedicalRecord.model.js';
import EHR     from '../../models/EHR.model.js';
import Patient from '../../models/Patient.model.js';
import Appointment from '../../models/Appointment.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';

const POPULATE_DOCTOR = { path: 'doctorId', populate: { path: 'userId', select: 'fullName' } };

// A doctor may only write clinical documents for patients they have actually
// treated — mirrors the same doctor↔patient link used by /doctor/my-patients.
const assertDoctorPatientAccess = async (doctorId, patientId) => {
  const hasAppointment = await Appointment.exists({ doctorId, patientId });
  if (!hasAppointment) throw new ApiError(403, 'Bu pasiyent sizə aid deyil');
};

export const getPatientEHR = async (patientId, { type, page = 1, limit = 50 } = {}, viewerRole) => {
  const filter = { patientId, isActive: true };
  if (type) filter.type = type;
  // Patients only ever see notes that have cleared clinical approval.
  if (viewerRole === 'PATIENT') filter.approvalStatus = 'approved';
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, parseInt(limit));
  const [records, total] = await Promise.all([
    EHR.find(filter).populate(POPULATE_DOCTOR).sort({ date: -1 }).skip((pg - 1) * lim).limit(lim),
    EHR.countDocuments(filter),
  ]);
  return { records, total, page: pg, limit: lim };
};

export const addEHRRecord = async (data, { doctorId, isPrivileged, userId, req } = {}) => {
  const patient = await Patient.findById(data.patientId);
  if (!patient) throw new ApiError(404, 'Pasiyent tapılmadı');
  const payload = { ...data };
  if (!isPrivileged) {
    payload.doctorId = doctorId;
    await assertDoctorPatientAccess(doctorId, data.patientId);
  }
  const record = await EHR.create(payload);
  await record.populate(POPULATE_DOCTOR);

  try {
    logAction({
      userId, action: 'EHR_RECORD_CREATE', resourceType: 'EHR', resourceId: record._id,
      description: 'EHR record created', req, metadata: { type: record.type },
    });
  } catch (_) {}

  return record;
};

export const updateEHRRecord = async (id, data, { doctorId, isPrivileged, userId, req } = {}) => {
  const existing = await EHR.findById(id);
  if (!existing) throw new ApiError(404, 'Qeyd tapılmadı');
  if (!isPrivileged && String(existing.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'Bu qeyd sizə aid deyil');
  }
  const clinicalFields = ['title', 'description', 'type', 'date', 'attachments'];
  const clinicalChanged = clinicalFields.some((key) => data[key] !== undefined);
  const safe = { ...data };
  delete safe.doctorId; // ownership is never reassigned through an edit
  if (clinicalChanged && ['approved', 'submitted'].includes(existing.approvalStatus)) {
    safe.approvalStatus = 'draft';
    safe.approvedBy = null;
    safe.approvedAt = null;
    safe.returnReason = '';
  }
  const r = await EHR.findByIdAndUpdate(id, safe, { new: true, runValidators: true }).populate(POPULATE_DOCTOR);
  if (!r) throw new ApiError(404, 'Qeyd tapılmadı');

  try {
    logAction({
      userId, action: 'EHR_RECORD_UPDATE', resourceType: 'EHR', resourceId: r._id,
      description: 'EHR record updated', req,
    });
  } catch (_) {}

  return r;
};

// Doctor's own documents across all patients — used by the Doctor Panel's
// "Medical Documents" list (status, return reason, etc.).
export const getMyRecords = async (doctorId, { type, approvalStatus, page = 1, limit = 50 } = {}) => {
  const filter = { doctorId, isActive: true };
  if (type) filter.type = type;
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, parseInt(limit));
  const [records, total] = await Promise.all([
    EHR.find(filter)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
      .sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    EHR.countDocuments(filter),
  ]);
  return { records, total, page: pg, limit: lim };
};

export const deleteEHRRecord = async (id) => {
  const r = await EHR.findByIdAndUpdate(id, { isActive: false });
  if (!r) throw new ApiError(404, 'Qeyd tapılmadı');
};

// Doctor submits a draft (or corrects and resubmits a returned) record for
// BAS_HEKIM/ADMIN approval. Only draft/returned records can be submitted —
// an approved record must go through chief-doctor archive, not a re-submit.
export const submitEHRRecord = async (id, { doctorId, isPrivileged, userId, req }) => {
  const record = await EHR.findById(id);
  if (!record) throw new ApiError(404, 'Qeyd tapılmadı');
  if (!isPrivileged && String(record.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'Bu qeyd sizə aid deyil');
  }
  if (!['draft', 'returned'].includes(record.approvalStatus)) {
    throw new ApiError(400, `Cannot submit a record with status '${record.approvalStatus}'`);
  }
  record.approvalStatus = 'submitted';
  record.submittedAt = new Date();
  record.returnReason = '';
  await record.save();

  try {
    logAction({
      userId, action: 'EHR_RECORD_SUBMIT', resourceType: 'EHR', resourceId: record._id,
      description: 'EHR record submitted for approval', req,
    });
  } catch (_) {}

  return record.populate(POPULATE_DOCTOR);
};

export const getEHRSummary = async (patientId) => {
  const [patient, records] = await Promise.all([
    Patient.findById(patientId).populate('userId', 'fullName email phone birthDate'),
    EHR.find({ patientId, isActive: true }).populate(POPULATE_DOCTOR).sort({ date: -1 }),
  ]);
  if (!patient) throw new ApiError(404, 'Pasiyent tapılmadı');
  return {
    patient,
    records,
    byType: {
      diagnosis:    records.filter(r => r.type === 'diagnosis'),
      procedure:    records.filter(r => r.type === 'procedure'),
      allergy:      records.filter(r => r.type === 'allergy'),
      prescription: records.filter(r => r.type === 'prescription'),
      lab:          records.filter(r => r.type === 'lab'),
      note:         records.filter(r => r.type === 'note'),
      vaccination:  records.filter(r => r.type === 'vaccination'),
    },
  };
};

// Append-only — no delete operation is exposed
export const createRecord = async (data, doctorId) => {
  return MedicalRecord.create({ ...data, doctorId });
};

export const getRecordsByPatient = async (patientId, { type, search, limit = 20, page = 1 } = {}) => {
  const filter = { patientId };
  if (type)   filter.type = type;
  if (search) filter.$or  = [
    { description: { $regex: search, $options: 'i' } },
    { diagnosis:   { $regex: search, $options: 'i' } },
    { title:       { $regex: search, $options: 'i' } },
  ];

  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  const [records, total] = await Promise.all([
    MedicalRecord.find(filter)
      .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName name surname' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName name surname email' } })
      .populate('visitId', 'chiefComplaint')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    MedicalRecord.countDocuments(filter),
  ]);

  return { records, total, page: pg, limit: lim };
};

export const getRecordById = async (id) => {
  const record = await MedicalRecord.findById(id)
    .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName name surname' } })
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName name surname email' } })
    .populate('visitId', 'chiefComplaint diagnosis status');
  if (!record) throw new ApiError(404, 'Record not found');
  return record;
};
