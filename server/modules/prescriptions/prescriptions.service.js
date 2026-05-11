import Prescription from '../../models/Prescription.model.js';
import Visit from '../../models/Visit.model.js';
import ApiError from '../../utils/ApiError.js';

const populatePrescription = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
    .populate({ path: 'prescribedBy', populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization' })
    .populate('visitId', 'chiefComplaint diagnosis status');

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createPrescription = async ({ visitId, patientId, medications, notes }, doctorId) => {
  const visit = await Visit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.status === 'closed') throw new ApiError(400, 'Visit is closed');
  if (String(visit.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only prescribe for your own visits');
  }

  const prescription = await Prescription.create({ visitId, patientId, medications, notes, prescribedBy: doctorId });

  // Link to visit
  await Visit.findByIdAndUpdate(visitId, { $push: { prescriptions: prescription._id } });

  return populatePrescription(Prescription.findById(prescription._id));
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getPrescriptionById = async (prescriptionId) => {
  const prescription = await populatePrescription(Prescription.findById(prescriptionId));
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  return prescription;
};

export const getPrescriptionsByVisit = async (visitId) => {
  return populatePrescription(Prescription.find({ visitId })).sort({ createdAt: -1 });
};

export const getPatientPrescriptions = async (patientId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);

  const [prescriptions, total] = await Promise.all([
    populatePrescription(Prescription.find({ patientId })).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Prescription.countDocuments({ patientId }),
  ]);

  return { prescriptions, total, page: pg, limit: lim };
};
