import MedicalRecord from '../../models/MedicalRecord.model.js';
import ApiError from '../../utils/ApiError.js';

// Append-only — no delete operation is exposed
export const createRecord = async (data, doctorId) => {
  return MedicalRecord.create({ ...data, doctorId });
};

export const getRecordsByPatient = async (patientId, query = {}) => {
  const filter = { patientId };
  if (query.type) filter.type = query.type;

  return MedicalRecord.find(filter)
    .populate('doctorId', 'specialization')
    .populate('visitId', 'chiefComplaint')
    .sort({ createdAt: -1 });
};

export const getRecordById = async (id) => {
  const record = await MedicalRecord.findById(id)
    .populate('doctorId')
    .populate('patientId')
    .populate('visitId');
  if (!record) throw new ApiError(404, 'Medical record not found');
  return record;
};
