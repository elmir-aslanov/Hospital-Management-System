import Patient from '../../models/Patient.model.js';
import User    from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import { createNotification } from '../notifications/notifications.service.js';

const POPULATE_USER = 'fullName email phone';

// ─── Create ──────────────────────────────────────────────────────────────────

export const createPatient = async ({ userId, bloodGroup, allergies, chronicConditions, emergencyContact }) => {
  const existing = await Patient.findOne({ userId });
  if (existing) throw new ApiError(409, 'Patient profile already exists');

  const patient = await Patient.create({ userId, bloodGroup, allergies, chronicConditions, emergencyContact });
  return patient.populate('userId', POPULATE_USER);
};

export const adminCreatePatient = async ({ fullName, email, phone, bloodGroup }) => {
  if (!fullName?.trim()) throw new ApiError(400, 'Ad Soyad tələb olunur');
  if (!email?.trim())    throw new ApiError(400, 'E-poçt tələb olunur');

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new ApiError(409, 'Bu e-poçt ünvanı artıq qeydiyyatdadır');

  const autoPassword = 'Patient' + Math.floor(1000 + Math.random() * 9000) + '!';
  const user = await User.create({
    fullName: fullName.trim(),
    email:    email.toLowerCase().trim(),
    phone:    phone?.trim() || '',
    password: autoPassword,
    role:     'PATIENT',
  });

  const patient = await Patient.create({ userId: user._id, bloodGroup: bloodGroup || undefined });
  await patient.populate('userId', POPULATE_USER);

  try {
    await createNotification({
      userId:  user._id,
      title:   'Xoş gəldiniz, ' + fullName.trim() + '!',
      message: `Aslan Medical sisteminə qeydiyyatınız tamamlandı. Pasiyent ID: ${patient.patientId || ''}`,
      type:    'general',
      link:    '/patient',
    });
  } catch (_) {}

  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Yeni pasiyent qeydiyyatı',
      message: `${fullName.trim()} sistemə yeni pasiyent kimi əlavə edildi.`,
      type:    'general',
      link:    '/admin/patients',
    })));
  } catch (_) {}

  return patient;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getPatients = async ({ page = 1, limit = 10 } = {}) => {
  const pg = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  const [patients, total] = await Promise.all([
    Patient.find()
      .populate('userId', POPULATE_USER)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Patient.countDocuments(),
  ]);

  return { patients, total, page: pg, limit: lim };
};

export const getPatientById = async (id) => {
  const patient = await Patient.findById(id).populate('userId', POPULATE_USER);
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePatient = async (id, updateData) => {
  const allowed = ['bloodGroup', 'allergies', 'chronicConditions', 'emergencyContact'];
  const safe = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) safe[key] = updateData[key];
  }

  const patient = await Patient.findByIdAndUpdate(id, safe, { new: true, runValidators: true })
    .populate('userId', POPULATE_USER);
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

// ─── Medical History ──────────────────────────────────────────────────────────

export const addMedicalHistory = async (id, { condition, diagnosedAt, notes }) => {
  const patient = await Patient.findById(id);
  if (!patient) throw new ApiError(404, 'Patient not found');

  patient.medicalHistory.push({ condition, diagnosedAt, notes });
  await patient.save();
  return patient.populate('userId', POPULATE_USER);
};

export const getMedicalHistory = async (id) => {
  const patient = await Patient.findById(id).select('medicalHistory patientId');
  if (!patient) throw new ApiError(404, 'Patient not found');

  const sorted = [...patient.medicalHistory].sort(
    (a, b) => new Date(b.diagnosedAt || 0) - new Date(a.diagnosedAt || 0)
  );
  return sorted;
};

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchPatients = async ({ query, condition, page = 1, limit = 10 } = {}) => {
  const pg = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  // Build aggregation pipeline so we can filter on populated User.fullName
  const pipeline = [];

  // Join with users collection
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userId',
    },
  });
  pipeline.push({ $unwind: '$userId' });

  // Apply filters
  const matchStage = {};

  if (query) {
    const regex = new RegExp(query, 'i');
    matchStage.$or = [
      { 'userId.fullName': regex },
      { patientId: regex },
    ];
  }

  if (condition) {
    matchStage['medicalHistory.condition'] = { $regex: condition, $options: 'i' };
  }

  if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

  // Count before slicing
  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [
    ...pipeline,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: lim },
    // Clean up user fields returned
    {
      $project: {
        patientId: 1, bloodGroup: 1, allergies: 1, chronicConditions: 1,
        emergencyContact: 1, medicalHistory: 1, createdAt: 1, updatedAt: 1,
        'userId._id': 1, 'userId.fullName': 1, 'userId.email': 1, 'userId.phone': 1,
      },
    },
  ];

  const [countResult, patients] = await Promise.all([
    Patient.aggregate(countPipeline),
    Patient.aggregate(dataPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;
  return { patients, total, page: pg, limit: lim };
};

export const searchPublic = async ({ patientId, birthDate }) => {
  if (!patientId?.trim()) throw new ApiError(400, 'Pasiyent ID tələb olunur');
  if (!birthDate)         throw new ApiError(400, 'Doğum tarixi tələb olunur');

  const patient = await Patient.findOne({ patientId: patientId.trim().toUpperCase() })
    .populate('userId', 'fullName name surname email birthDate');
  if (!patient) throw new ApiError(404, 'Bu ID ilə pasiyent tapılmadı');

  const userBirth = patient.userId?.birthDate;
  if (!userBirth) throw new ApiError(404, 'Pasiyent məlumatları tam deyil');

  const inputDate  = new Date(birthDate).toDateString();
  const storedDate = new Date(userBirth).toDateString();
  if (inputDate !== storedDate) throw new ApiError(401, 'Doğum tarixi uyğun gəlmir');

  return {
    patientId:      patient.patientId,
    fullName:       patient.userId?.fullName || '',
    bloodGroup:     patient.bloodGroup || null,
    allergies:      patient.allergies  || [],
    medicalHistory: patient.medicalHistory?.slice(-3) || [],
  };
};
