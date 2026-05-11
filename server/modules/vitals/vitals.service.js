import Vitals from '../../models/Vitals.model.js';
import Patient from '../../models/Patient.model.js';
import Visit from '../../models/Visit.model.js';
import ApiError from '../../utils/ApiError.js';

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const recordVitals = async (data, recordedBy) => {
  const [patient, visit] = await Promise.all([
    Patient.findById(data.patientId),
    Visit.findById(data.visitId),
  ]);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!visit)   throw new ApiError(404, 'Visit not found');
  if (visit.status === 'closed') throw new ApiError(400, 'Visit is closed');

  return Vitals.create({ ...data, recordedBy });
};

export const getVitalsByVisit = async (visitId) => {
  return Vitals.find({ visitId })
    .populate('recordedBy', 'fullName role')
    .sort({ recordedAt: 1 });
};

export const getPatientVitalsHistory = async (patientId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);

  const [vitals, total] = await Promise.all([
    Vitals.find({ patientId })
      .populate('visitId', 'chiefComplaint')
      .populate('recordedBy', 'fullName')
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(lim),
    Vitals.countDocuments({ patientId }),
  ]);

  return { vitals, total, page: pg, limit: lim };
};

export const getLatestVitals = async (patientId) => {
  return Vitals.findOne({ patientId })
    .populate('visitId', 'chiefComplaint')
    .populate('recordedBy', 'fullName')
    .sort({ recordedAt: -1 });
};

export const getVitalsTrend = async (patientId) => {
  const records = await Vitals.find({ patientId })
    .select('recordedAt heartRate bloodPressure temperature oxygenSaturation bmi')
    .sort({ recordedAt: -1 })
    .limit(10);

  return records.reverse(); // chronological order for charts
};
