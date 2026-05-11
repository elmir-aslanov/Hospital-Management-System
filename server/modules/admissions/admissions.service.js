import Admission from '../../models/Admission.model.js';
import Patient from '../../models/Patient.model.js';
import Bed from '../../models/Bed.model.js';
import ApiError from '../../utils/ApiError.js';
import { ADMISSION_STATUS, BED_STATUS } from '../../config/constants.js';

// ─── Population helper ────────────────────────────────────────────────────────

const populateAdmission = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } })
    .populate({ path: 'bedId', select: 'bedNumber status', populate: { path: 'roomId', select: 'roomNumber' } })
    .populate('wardId', 'name type floor')
    .populate('admittedBy', 'fullName email');

// ─── Pagination helper ────────────────────────────────────────────────────────

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

// ─── Admit ────────────────────────────────────────────────────────────────────

export const admitPatient = async ({ patientId, bedId, wardId, reason }, admittedBy) => {
  const [patient, bed] = await Promise.all([
    Patient.findById(patientId),
    Bed.findById(bedId),
  ]);

  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!bed)     throw new ApiError(404, 'Bed not found');

  if (bed.status !== BED_STATUS.AVAILABLE) {
    throw new ApiError(409, 'Bed is not available');
  }

  const activeAdmission = await Admission.findOne({
    patientId,
    status: ADMISSION_STATUS.ADMITTED,
  });
  if (activeAdmission) throw new ApiError(409, 'Patient is already admitted');

  // Atomically mark bed occupied before creating the document
  await Bed.findByIdAndUpdate(bedId, {
    status: BED_STATUS.OCCUPIED,
    currentPatientId: patientId,
  });

  const admission = await Admission.create({
    patientId, bedId, wardId, reason,
    admittedBy,
    admissionDate: new Date(),
    status: ADMISSION_STATUS.ADMITTED,
  });

  return populateAdmission(Admission.findById(admission._id));
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getAdmissions = async ({ status, wardId, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};
  if (status) filter.status = status;
  if (wardId) filter.wardId = wardId;

  const [admissions, total] = await Promise.all([
    populateAdmission(Admission.find(filter)).sort({ admissionDate: -1 }).skip(skip).limit(lim),
    Admission.countDocuments(filter),
  ]);

  return { admissions, total, page: pg, limit: lim };
};

export const getAdmissionById = async (admissionId) => {
  const admission = await populateAdmission(Admission.findById(admissionId));
  if (!admission) throw new ApiError(404, 'Admission not found');
  return admission;
};

export const getActiveAdmissions = async () => {
  return populateAdmission(
    Admission.find({ status: ADMISSION_STATUS.ADMITTED })
  ).sort({ admissionDate: -1 });
};

export const getPatientAdmissionHistory = async (patientId) => {
  return populateAdmission(
    Admission.find({ patientId })
  ).sort({ admissionDate: -1 });
};

// ─── Discharge ────────────────────────────────────────────────────────────────

export const dischargePatient = async (admissionId, { dischargeDate } = {}) => {
  const admission = await Admission.findById(admissionId);
  if (!admission) throw new ApiError(404, 'Admission not found');

  if (admission.status === ADMISSION_STATUS.DISCHARGED) {
    throw new ApiError(400, 'Patient already discharged');
  }

  admission.status       = ADMISSION_STATUS.DISCHARGED;
  admission.dischargeDate = dischargeDate ? new Date(dischargeDate) : new Date();
  await admission.save();

  // Free the bed
  await Bed.findByIdAndUpdate(admission.bedId, {
    status: BED_STATUS.AVAILABLE,
    currentPatientId: null,
  });

  return populateAdmission(Admission.findById(admission._id));
};
