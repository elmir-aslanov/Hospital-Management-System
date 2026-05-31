import MedicalRecord from '../../models/MedicalRecord.model.js';
import ApiError from '../../utils/ApiError.js';

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
