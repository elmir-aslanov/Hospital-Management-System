import Admission from '../../models/Admission.model.js';
import Patient from '../../models/Patient.model.js';
import Bed from '../../models/Bed.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';
import { ADMISSION_STATUS, BED_STATUS } from '../../config/constants.js';

const populateAdmission = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } })
    .populate({ path: 'bedId', select: 'bedNumber status', populate: { path: 'roomId', select: 'roomNumber' } })
    .populate('wardId', 'name type floor')
    .populate('admittedBy', 'fullName email');

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const admitPatient = async ({ patientId, bedId, wardId, reason }, admittedBy, req) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const activeAdmission = await Admission.findOne({ patientId, status: ADMISSION_STATUS.ADMITTED });
  if (activeAdmission) throw new ApiError(409, 'Patient is already admitted');

  // Atomic claim — only matches (and flips) the bed when it's still available,
  // so two concurrent admit requests can never both land on the same bed.
  const bed = await Bed.findOneAndUpdate(
    { _id: bedId, status: BED_STATUS.AVAILABLE },
    { $set: { status: BED_STATUS.OCCUPIED, currentPatientId: patientId } },
  );
  if (!bed) {
    const exists = await Bed.exists({ _id: bedId });
    throw new ApiError(exists ? 409 : 404, exists ? 'Bed is not available' : 'Bed not found');
  }

  const admission = await Admission.create({
    patientId, bedId, wardId, reason, admittedBy,
    admissionDate: new Date(),
    status: ADMISSION_STATUS.ADMITTED,
  });

  logAction({ userId: admittedBy, action: 'ADMISSION_CREATE', resourceType: 'Admission', resourceId: admission._id, description: `Patient ${patientId} admitted`, req });

  return populateAdmission(Admission.findById(admission._id));
};

// Moves an actively-admitted patient to a different bed — frees the old bed
// only after the new one has been atomically claimed, so a failed transfer
// never leaves the patient bed-less.
export const transferPatient = async (admissionId, { bedId: newBedId }, userId, req) => {
  const admission = await Admission.findById(admissionId);
  if (!admission) throw new ApiError(404, 'Admission not found');
  if (admission.status !== ADMISSION_STATUS.ADMITTED) {
    throw new ApiError(400, `Cannot transfer an admission with status '${admission.status}'`);
  }
  if (String(admission.bedId) === String(newBedId)) {
    throw new ApiError(400, 'Patient is already in this bed');
  }

  const newBed = await Bed.findById(newBedId);
  if (!newBed) throw new ApiError(404, 'Bed not found');

  const claimedBed = await Bed.findOneAndUpdate(
    { _id: newBedId, status: BED_STATUS.AVAILABLE },
    { $set: { status: BED_STATUS.OCCUPIED, currentPatientId: admission.patientId } },
  );
  if (!claimedBed) throw new ApiError(409, 'Target bed is not available');

  const oldBedId = admission.bedId;
  admission.bedId  = newBedId;
  admission.wardId = newBed.wardId;
  await admission.save();

  await Bed.findByIdAndUpdate(oldBedId, { status: BED_STATUS.AVAILABLE, currentPatientId: null });

  logAction({ userId, action: 'ADMISSION_TRANSFER', resourceType: 'Admission', resourceId: admission._id, description: `Patient transferred to bed ${newBedId}`, req });

  return populateAdmission(Admission.findById(admission._id));
};

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

export const getActiveAdmissions = async () =>
  populateAdmission(Admission.find({ status: ADMISSION_STATUS.ADMITTED })).sort({ admissionDate: -1 });

export const getPatientAdmissionHistory = async (patientId) =>
  populateAdmission(Admission.find({ patientId })).sort({ admissionDate: -1 });

export const dischargePatient = async (admissionId, { dischargeDate } = {}, userId, req) => {
  const admission = await Admission.findById(admissionId);
  if (!admission) throw new ApiError(404, 'Admission not found');
  if (admission.status === ADMISSION_STATUS.DISCHARGED) throw new ApiError(400, 'Patient already discharged');

  admission.status      = ADMISSION_STATUS.DISCHARGED;
  admission.dischargeDate = dischargeDate ? new Date(dischargeDate) : new Date();
  await admission.save();

  await Bed.findByIdAndUpdate(admission.bedId, { status: BED_STATUS.AVAILABLE, currentPatientId: null });

  logAction({ userId, action: 'PATIENT_DISCHARGE', resourceType: 'Admission', resourceId: admission._id, description: `Patient discharged from admission ${admissionId}`, req });

  return populateAdmission(Admission.findById(admission._id));
};
