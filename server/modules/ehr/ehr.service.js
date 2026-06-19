import MedicalRecord from '../../models/MedicalRecord.model.js';
import EHR     from '../../models/EHR.model.js';
import Patient from '../../models/Patient.model.js';
import ApiError from '../../utils/ApiError.js';

const POPULATE_DOCTOR = { path: 'doctorId', populate: { path: 'userId', select: 'fullName' } };

export const getPatientEHR = async (patientId, { type, page = 1, limit = 50 } = {}) => {
  const filter = { patientId, isActive: true };
  if (type) filter.type = type;
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, parseInt(limit));
  const [records, total] = await Promise.all([
    EHR.find(filter).populate(POPULATE_DOCTOR).sort({ date: -1 }).skip((pg - 1) * lim).limit(lim),
    EHR.countDocuments(filter),
  ]);
  return { records, total, page: pg, limit: lim };
};

export const addEHRRecord = async (data) => {
  const patient = await Patient.findById(data.patientId);
  if (!patient) throw new ApiError(404, 'Pasiyent tapılmadı');
  const record = await EHR.create(data);
  await record.populate(POPULATE_DOCTOR);
  return record;
};

export const updateEHRRecord = async (id, data) => {
  const existing = await EHR.findById(id);
  if (!existing) throw new ApiError(404, 'Qeyd tapılmadı');
  const clinicalFields = ['title', 'description', 'type', 'date', 'attachments'];
  const clinicalChanged = clinicalFields.some((key) => data[key] !== undefined);
  const safe = { ...data };
  if (clinicalChanged && ['approved', 'submitted'].includes(existing.approvalStatus)) {
    safe.approvalStatus = 'draft';
    safe.approvedBy = null;
    safe.approvedAt = null;
    safe.returnReason = '';
  }
  const r = await EHR.findByIdAndUpdate(id, safe, { new: true, runValidators: true }).populate(POPULATE_DOCTOR);
  if (!r) throw new ApiError(404, 'Qeyd tapılmadı');
  return r;
};

export const deleteEHRRecord = async (id) => {
  const r = await EHR.findByIdAndUpdate(id, { isActive: false });
  if (!r) throw new ApiError(404, 'Qeyd tapılmadı');
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
