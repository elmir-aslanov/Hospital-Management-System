import mongoose from 'mongoose';
import Prescription from '../../models/Prescription.model.js';
import Visit from '../../models/Visit.model.js';
import Doctor from '../../models/Doctor.model.js';
import ApiError from '../../utils/ApiError.js';
import checkDrugAllergies, { checkDrugInteractions } from '../../utils/drugInteractionCheck.js';
import logAction from '../../utils/auditLogger.js';

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

const resolveDoctorFilterId = async (doctorId) => {
  if (!doctorId || !mongoose.isValidObjectId(doctorId)) return null;

  const doctor = await Doctor.findOne({
    $or: [{ _id: doctorId }, { userId: doctorId }],
  }).select('_id');

  return doctor?._id ?? doctorId;
};

export const createPrescription = async ({ visitId, patientId, medications, notes }, doctorId, req) => {
  const visit = await Visit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.status === 'closed') throw new ApiError(400, 'Visit is closed');
  if (String(visit.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only prescribe for your own visits');
  }

  // Drug allergy check
  const allergyCheck = await checkDrugAllergies(patientId, medications);
  if (!allergyCheck.safe) {
    throw new ApiError(400, 'Drug allergy conflict detected', allergyCheck.conflicts);
  }

  // Drug interaction check
  try {
    const drugNames = (medications || []).map(m => m.name || m.drugName || m.medicine);
    if (drugNames.length > 1) {
      const interactions = await checkDrugInteractions(drugNames);
      if (interactions?.hasInteraction) {
        console.warn(`Drug interaction warning for patient ${patientId}:`, interactions.details);
        // Don't block — just log. Doctor is responsible.
      }
    }
  } catch (_) {}

  const prescription = await Prescription.create({ visitId, patientId, medications, notes, prescribedBy: doctorId });

  await Visit.findByIdAndUpdate(visitId, { $push: { prescriptions: prescription._id } });

  try {
    logAction({ userId: doctorId, action: 'PRESCRIPTION_CREATE', resourceType: 'Prescription', resourceId: prescription._id, description: `Prescription created for patient ${patientId}`, req });
  } catch (_) {}

  return populatePrescription(Prescription.findById(prescription._id));
};

export const getPrescriptionById = async (prescriptionId) => {
  const prescription = await populatePrescription(Prescription.findById(prescriptionId));
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  return prescription;
};

export const getPrescriptions = async ({ doctorId, patientId, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};

  if (patientId) filter.patientId = patientId;
  if (doctorId) {
    const prescribedBy = await resolveDoctorFilterId(doctorId);
    filter.prescribedBy = prescribedBy ?? new mongoose.Types.ObjectId();
  }

  const [prescriptions, total] = await Promise.all([
    populatePrescription(Prescription.find(filter)).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Prescription.countDocuments(filter),
  ]);

  return { prescriptions, total, page: pg, limit: lim };
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

export const deletePrescription = async (prescriptionId, { userRole, doctorId, userId, req } = {}) => {
  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) throw new ApiError(404, 'Prescription not found');

  if (userRole === 'DOCTOR' && String(prescription.prescribedBy) !== String(doctorId)) {
    throw new ApiError(403, 'You can only delete your own prescriptions');
  }

  await Prescription.findByIdAndDelete(prescription._id);
  await Visit.findByIdAndUpdate(prescription.visitId, { $pull: { prescriptions: prescription._id } });

  try {
    logAction({
      userId,
      action: 'PRESCRIPTION_DELETE',
      resourceType: 'Prescription',
      resourceId: prescription._id,
      description: `Prescription deleted for patient ${prescription.patientId}`,
      req,
    });
  } catch (_) {}

  return { id: prescription._id };
};
