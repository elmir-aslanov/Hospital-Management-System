import Visit from '../../models/Visit.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import Appointment from '../../models/Appointment.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';

const populateVisit = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } })
    .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization' })
    .populate({ path: 'prescriptions', populate: { path: 'prescribedBy', populate: { path: 'userId', select: 'fullName' } } });

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const createVisit = async ({ patientId, doctorId, appointmentId, chiefComplaint }, req) => {
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!doctor)  throw new ApiError(404, 'Doctor not found');

  if (appointmentId) {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new ApiError(404, 'Appointment not found');
    if (String(appt.patientId) !== String(patientId) || String(appt.doctorId) !== String(doctorId)) {
      throw new ApiError(400, 'Appointment does not match the given patient and doctor');
    }
  }

  const visit = await Visit.create({ patientId, doctorId, appointmentId, chiefComplaint });

  logAction({ userId: doctorId, action: 'VISIT_CREATE', resourceType: 'Visit', resourceId: visit._id, description: `Visit created for patient ${patientId}`, req });

  return populateVisit(Visit.findById(visit._id));
};

export const getVisitById = async (visitId) => {
  const visit = await populateVisit(Visit.findById(visitId));
  if (!visit) throw new ApiError(404, 'Visit not found');
  return visit;
};

export const getPatientVisits = async (patientId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const [visits, total] = await Promise.all([
    populateVisit(Visit.find({ patientId })).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Visit.countDocuments({ patientId }),
  ]);
  return { visits, total, page: pg, limit: lim };
};

export const getDoctorVisits = async (doctorId, { status, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = { doctorId };
  if (status) filter.status = status;
  const [visits, total] = await Promise.all([
    populateVisit(Visit.find(filter)).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Visit.countDocuments(filter),
  ]);
  return { visits, total, page: pg, limit: lim };
};

export const updateVisit = async (visitId, { diagnosis, clinicalNotes }) => {
  const visit = await Visit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.status === 'closed') throw new ApiError(400, 'Cannot update a closed visit');
  if (diagnosis     !== undefined) visit.diagnosis     = diagnosis;
  if (clinicalNotes !== undefined) visit.clinicalNotes = clinicalNotes;
  await visit.save();
  return populateVisit(Visit.findById(visit._id));
};

export const closeVisit = async (visitId, doctorId, req) => {
  const visit = await Visit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.status === 'closed') throw new ApiError(400, 'Visit already closed');
  if (String(visit.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You are not authorized to close this visit');
  }
  visit.status = 'closed';
  await visit.save();

  logAction({ userId: doctorId, action: 'VISIT_CLOSE', resourceType: 'Visit', resourceId: visit._id, description: `Visit closed by doctor`, req });

  return populateVisit(Visit.findById(visit._id));
};
