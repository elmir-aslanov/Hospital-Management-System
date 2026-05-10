import Admission from '../../models/Admission.model.js';
import Bed from '../../models/Bed.model.js';
import ApiError from '../../utils/ApiError.js';
import { BED_STATUS, ADMISSION_STATUS } from '../../config/constants.js';

export const admitPatient = async (data, admittedBy) => {
  const bed = await Bed.findById(data.bedId);
  if (!bed) throw new ApiError(404, 'Bed not found');
  if (bed.status !== BED_STATUS.AVAILABLE) throw new ApiError(409, 'Bed is not available');

  // Mark bed as occupied atomically before creating the admission
  bed.status = BED_STATUS.OCCUPIED;
  bed.currentPatientId = data.patientId;
  await bed.save();

  return Admission.create({ ...data, admittedBy, admissionDate: new Date() });
};

export const getAdmissions = async (query = {}) => {
  const filter = { status: ADMISSION_STATUS.ACTIVE };
  if (query.wardId) filter.wardId = query.wardId;

  return Admission.find(filter)
    .populate('patientId', 'patientId')
    .populate('bedId', 'bedNumber')
    .populate('wardId', 'name')
    .sort({ admissionDate: -1 });
};

export const getAdmissionById = async (id) => {
  const admission = await Admission.findById(id)
    .populate('patientId')
    .populate('bedId')
    .populate('wardId');
  if (!admission) throw new ApiError(404, 'Admission not found');
  return admission;
};

export const dischargePatient = async (id) => {
  const admission = await Admission.findById(id);
  if (!admission) throw new ApiError(404, 'Admission not found');
  if (admission.status !== ADMISSION_STATUS.ACTIVE) {
    throw new ApiError(409, 'Patient is already discharged');
  }

  admission.status = ADMISSION_STATUS.DISCHARGED;
  admission.dischargeDate = new Date();
  await admission.save();

  await Bed.findByIdAndUpdate(admission.bedId, {
    status: BED_STATUS.AVAILABLE,
    currentPatientId: null,
  });

  return admission;
};
