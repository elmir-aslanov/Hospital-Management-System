import mongoose from 'mongoose';
import Doctor from '../../models/Doctor.model.js';
import User from '../../models/User.model.js';
import WorkSchedule from '../../models/WorkSchedule.model.js';
import Appointment from '../../models/Appointment.model.js';
import ApiError from '../../utils/ApiError.js';

const POPULATE_USER = 'fullName name surname email phone photoUrl department role';
const POPULATE_DEPT = { path: 'departmentId', select: 'name slug icon _id' };

export const getPublicDoctors = async (limit = 8) => {
  const lim = Math.min(20, Math.max(1, parseInt(limit) || 8));
  return Doctor.find({ isActive: true, isAvailable: true })
    .populate('userId', POPULATE_USER)
    .populate(POPULATE_DEPT)
    .sort({ order: 1, averageRating: -1 })
    .limit(lim)
    .lean();
};

export const getAllPublicDoctors = async () => {
  return Doctor.find({ isActive: true })
    .populate('userId', POPULATE_USER)
    .populate(POPULATE_DEPT)
    .sort({ order: 1, createdAt: -1 })
    .lean();
};

// Public-safe doctor profile — only fields the public detail page is allowed to see
export const getPublicDoctorById = async (id) => {
  const doctor = await Doctor.findOne({ _id: id, isActive: true })
    .populate('userId', 'fullName name surname photoUrl')
    .populate(POPULATE_DEPT)
    .lean();
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const fullName = doctor.userId?.fullName
    || [doctor.userId?.name, doctor.userId?.surname].filter(Boolean).join(' ')
    || '';

  return {
    _id: doctor._id,
    fullName,
    title: doctor.academicTitle || '',
    department: doctor.departmentId
      ? { _id: doctor.departmentId._id, name: doctor.departmentId.name }
      : null,
    specialty: doctor.specialization || '',
    image: doctor.image || doctor.userId?.photoUrl || '',
    bio: doctor.bio || '',
    activityAreas: doctor.activityAreas || [],
    education: doctor.education || [],
    publications: doctor.publications || [],
    courses: doctor.courses || [],
    memberships: doctor.memberships || [],
    consultationFee: doctor.consultationFee || 0,
    rating: doctor.averageRating || 0,
    reviewsCount: doctor.totalRatings || 0,
    isAcceptingAppointments: doctor.isAvailable !== false,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const generateTimeSlots = (startTime, endTime, slotDuration) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots = [];
  for (let t = start; t + slotDuration <= end; t += slotDuration) {
    slots.push(minutesToTime(t));
  }
  return slots;
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createDoctor = async ({ userId, specialization, licenseNumber, experience, bio }) => {
  const [existingUser, existingLicense] = await Promise.all([
    Doctor.findOne({ userId }),
    Doctor.findOne({ licenseNumber }),
  ]);

  if (existingUser) throw new ApiError(409, 'Doctor profile already exists');
  if (existingLicense) throw new ApiError(409, 'License number already registered');

  const doctor = await Doctor.create({ userId, specialization, licenseNumber, experience, bio });
  return doctor.populate('userId', POPULATE_USER);
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getDoctors = async ({ specialization, isAvailable, department, page = 1, limit = 10 } = {}) => {
  const pg = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  const filter = {};
  if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true' || isAvailable === true;
  if (department)    filter.department    = { $regex: department, $options: 'i' };

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate('userId', POPULATE_USER)
      .populate(POPULATE_DEPT)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Doctor.countDocuments(filter),
  ]);

  return { doctors, total, page: pg, limit: lim };
};

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id)
    .populate('userId', POPULATE_USER)
    .populate(POPULATE_DEPT);
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateDoctor = async (id, updateData) => {
  const allowed = ['specialization', 'licenseNumber', 'experience', 'bio', 'isAvailable',
                   'department', 'departmentId', 'image', 'order', 'isActive', 'consultationFee', 'languages',
                   'academicTitle', 'activityAreas', 'education', 'publications', 'courses', 'memberships'];
  const safe = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) safe[key] = updateData[key];
  }

  if (safe.departmentId) {
    const dept = await mongoose.model('Department').findById(safe.departmentId);
    if (!dept) throw new ApiError(404, 'Department not found');
    safe.department = dept.name;
  }

  const doctor = await Doctor.findByIdAndUpdate(id, safe, { new: true, runValidators: true })
    .populate('userId', POPULATE_USER)
    .populate(POPULATE_DEPT);
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteDoctor = async (id) => {
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};

// ─── Schedule ─────────────────────────────────────────────────────────────────

export const getDoctorSchedule = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  return WorkSchedule.find({ doctorId }).sort({ dayOfWeek: 1 });
};

export const updateDoctorSchedule = async (doctorId, scheduleArray) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const ops = scheduleArray.map(({ dayOfWeek, startTime, endTime, slotDuration, isOff }) =>
    WorkSchedule.findOneAndUpdate(
      { doctorId, dayOfWeek },
      { doctorId, dayOfWeek, startTime, endTime, slotDuration, isOff },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )
  );

  const updated = await Promise.all(ops);
  return updated.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
};

// ─── Availability ─────────────────────────────────────────────────────────────

export const getDoctorAvailability = async (doctorId, dateStr) => {
  if (!dateStr) throw new ApiError(400, 'date query parameter is required (YYYY-MM-DD)');

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');

  const dayOfWeek = date.getDay();

  const schedule = await WorkSchedule.findOne({ doctorId, dayOfWeek });
  if (!schedule || schedule.isOff) {
    return { available: false, slots: [], reason: schedule ? 'Day off' : 'No schedule set' };
  }

  // Get all booked appointments for this doctor on this date
  const dayStart = new Date(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateStr);
  dayEnd.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: ['cancelled', 'missed', 'no_show'] },
  }).select('startTime endTime');

  const bookedStartTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const allSlots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration);

  const slots = allSlots.map((time) => ({
    time,
    available: !bookedStartTimes.has(time),
  }));

  return {
    available: true,
    date: dateStr,
    dayOfWeek,
    workHours: { start: schedule.startTime, end: schedule.endTime },
    slotDuration: schedule.slotDuration,
    slots,
  };
};

// ─── Admin one-step doctor creation ──────────────────────────────────────────

export const adminCreateDoctor = async ({ fullName, email, specialization, experience, bio, department, departmentId, consultationFee, order }) => {
  if (!fullName?.trim())       throw new ApiError(400, 'Ad Soyad tələb olunur');
  if (!email?.trim())          throw new ApiError(400, 'E-poçt tələb olunur');
  if (!specialization?.trim()) throw new ApiError(400, 'İxtisas tələb olunur');

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new ApiError(409, 'Bu e-poçt artıq qeydiyyatdadır');

  // Auto-generate license number: DR-YYYY-XXXXX
  let licenseNumber;
  let attempts = 0;
  do {
    const rand = Math.floor(10000 + Math.random() * 90000);
    licenseNumber = `DR-${new Date().getFullYear()}-${rand}`;
    attempts++;
    if (attempts > 20) break;
  } while (await Doctor.exists({ licenseNumber }));

  const autoPassword = 'Aslan@' + Math.floor(1000 + Math.random() * 9000);

  const user = await User.create({
    fullName: fullName.trim(),
    email:    email.toLowerCase().trim(),
    password: autoPassword,
    role:     'DOCTOR',
  });

  const doctor = await Doctor.create({
    userId:          user._id,
    specialization:  specialization.trim(),
    licenseNumber,
    experience:      Number(experience) || 0,
    bio:             bio?.trim() || '',
    department:      department?.trim() || '',
    departmentId:    departmentId || undefined,
    consultationFee: Number(consultationFee) || 0,
    order:           Number(order) || 0,
    isActive:        true,
    isAvailable:     true,
  });

  await doctor.populate('userId', POPULATE_USER);

  // TODO: send email with autoPassword when email service is configured
  console.log(`[Doctor Created] ${fullName} | ${email} | Password: ${autoPassword} | License: ${licenseNumber}`);

  return { doctor, autoPassword, licenseNumber };
};
