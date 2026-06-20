import mongoose from 'mongoose';
import Doctor from '../../models/Doctor.model.js';
import User from '../../models/User.model.js';
import WorkSchedule from '../../models/WorkSchedule.model.js';
import Department from '../../models/Department.model.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import sendEmail from '../../utils/sendEmail.js';
import { uploadImageBuffer, deleteImage } from '../../config/cloudinary.js';

const POPULATE_USER = 'fullName name surname email phone photoUrl department role';
const POPULATE_DEPT = { path: 'departmentId', select: 'name slug icon isActive _id' };
const DOCTOR_IMAGE_FOLDER = 'aslan-medical/doctors';

export const getPublicDoctors = async (limit = 8) => {
  const lim = Math.min(20, Math.max(1, parseInt(limit) || 8));
  return Doctor.find({ isActive: true, isAvailable: true })
    .populate('userId', POPULATE_USER)
    .populate(POPULATE_DEPT)
    .sort({ order: 1, averageRating: -1 })
    .limit(lim)
    .lean();
};

// Mirrors appointments.service.js DEFAULT_HOURS day map — a doctor with no
// WorkSchedule rows at all follows clinic defaults (Mon–Sat, Sun closed).
const DEFAULT_AVAILABLE_DAYS = new Set([1, 2, 3, 4, 5, 6]);

export const getAllPublicDoctors = async ({ search, departmentId, day, isActive } = {}) => {
  const filter = { isActive: isActive === undefined ? true : isActive === 'true' || isActive === true };
  if (departmentId) filter.departmentId = departmentId;
  if (search) {
    const userIds = await User.find({ fullName: new RegExp(search, 'i') }).distinct('_id');
    filter.$or = [
      { userId: { $in: userIds } },
      { specialization: new RegExp(search, 'i') },
    ];
  }

  const doctors = await Doctor.find(filter)
    .populate('userId', POPULATE_USER)
    .populate(POPULATE_DEPT)
    .sort({ order: 1, createdAt: -1 })
    .lean();

  // Single bulk schedule query — avoids an N+1 lookup per doctor.
  const schedules = await WorkSchedule.find({ doctorId: { $in: doctors.map((d) => d._id) } })
    .select('doctorId dayOfWeek isOff');
  const hasSchedule = new Set();
  const availableDaysByDoctor = {};
  for (const s of schedules) {
    const key = String(s.doctorId);
    hasSchedule.add(key);
    if (!s.isOff) (availableDaysByDoctor[key] ||= new Set()).add(s.dayOfWeek);
  }
  const isAvailableOn = (doctorId, dow) => {
    const key = String(doctorId);
    return hasSchedule.has(key) ? (availableDaysByDoctor[key]?.has(dow) || false) : DEFAULT_AVAILABLE_DAYS.has(dow);
  };

  const todayDow = new Date().getDay();
  let result = doctors.map((d) => ({ ...d, availableToday: isAvailableOn(d._id, todayDow) }));

  if (day !== undefined && day !== null && day !== '') {
    const dow = Number(day);
    result = result.filter((d) => isAvailableOn(d._id, dow));
  }

  return result;
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

const uploadDoctorImage = async (file) => {
  if (!file) return null;

  try {
    const result = await uploadImageBuffer(file.buffer, {
      folder: DOCTOR_IMAGE_FOLDER,
      transformation: [
        { width: 600, height: 600, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    logger.error(`Doctor image upload failed: ${err.message}`);
    throw new ApiError(400, 'Şəkil yüklənmədi');
  }
};

const deleteDoctorImage = async (publicId) => {
  if (!publicId) return;

  try {
    await deleteImage(publicId);
  } catch (err) {
    logger.error(`Doctor image delete failed (${publicId}): ${err.message}`);
  }
};

// ─── Create ───────────────────────────────────────────────────────────────────

const resolveDepartment = async (departmentId, { allowInactiveId } = {}) => {
  if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
    throw new ApiError(400, 'Şöbə seçilməlidir');
  }
  const department = await Department.findById(departmentId);
  if (!department) throw new ApiError(404, 'Şöbə tapılmadı');
  if (!department.isActive && String(department._id) !== String(allowInactiveId || '')) {
    throw new ApiError(400, 'Deaktiv şöbə yeni seçim kimi istifadə edilə bilməz');
  }
  return department;
};

export const createDoctor = async ({ userId, specialization, licenseNumber, experience, bio, departmentId }, imageFile) => {
  const assignedDepartment = await resolveDepartment(departmentId);
  const [existingUser, existingLicense] = await Promise.all([
    Doctor.findOne({ userId }),
    Doctor.findOne({ licenseNumber }),
  ]);

  if (existingUser) throw new ApiError(409, 'Doctor profile already exists');
  if (existingLicense) throw new ApiError(409, 'License number already registered');

  const uploadedImage = await uploadDoctorImage(imageFile);

  try {
    const doctor = await Doctor.create({
      userId,
      specialization,
      licenseNumber,
      experience,
      bio,
      department: assignedDepartment.name,
      departmentId: assignedDepartment._id,
      ...(uploadedImage && {
        image: uploadedImage.url,
        imagePublicId: uploadedImage.publicId,
      }),
    });
    await doctor.populate('userId', POPULATE_USER);
    return doctor.populate(POPULATE_DEPT);
  } catch (err) {
    await deleteDoctorImage(uploadedImage?.publicId);
    throw err;
  }
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

export const updateDoctor = async (id, updateData, imageFile) => {
  const allowed = ['specialization', 'licenseNumber', 'experience', 'bio', 'isAvailable',
                   'department', 'departmentId', 'image', 'order', 'isActive', 'consultationFee', 'languages',
                   'academicTitle', 'activityAreas', 'education', 'publications', 'courses', 'memberships'];
  const safe = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) safe[key] = updateData[key];
  }

  if (imageFile) {
    delete safe.image;
  }

  const existing = await Doctor.findById(id);
  if (!existing) throw new ApiError(404, 'Doctor not found');

  if (updateData.departmentId !== undefined) {
    const dept = await resolveDepartment(safe.departmentId, { allowInactiveId: existing.departmentId });
    safe.departmentId = dept._id;
    safe.department = dept.name;
  }
  const oldImagePublicId = existing.imagePublicId;
  const legacyImageChanged = !imageFile
    && safe.image !== undefined
    && safe.image !== existing.image;

  if (legacyImageChanged) {
    safe.imagePublicId = '';
  }

  const uploadedImage = await uploadDoctorImage(imageFile);
  if (uploadedImage) {
    safe.image = uploadedImage.url;
    safe.imagePublicId = uploadedImage.publicId;
  }

  try {
    Object.assign(existing, safe);
    await existing.save();
  } catch (err) {
    await deleteDoctorImage(uploadedImage?.publicId);
    throw err;
  }

  if ((uploadedImage || legacyImageChanged) && oldImagePublicId && oldImagePublicId !== uploadedImage?.publicId) {
    await deleteDoctorImage(oldImagePublicId);
  }

  const doctor = await Doctor.findById(id)
    .populate('userId', POPULATE_USER)
    .populate(POPULATE_DEPT);
  return doctor;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteDoctor = async (id) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  await deleteDoctorImage(doctor.imagePublicId);
  await Doctor.findByIdAndDelete(id);
  return doctor;
};

// ─── Schedule ─────────────────────────────────────────────────────────────────

export const getDoctorSchedule = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  return WorkSchedule.find({ doctorId }).sort({ dayOfWeek: 1 });
};

// Days with at least one working (non-off) entry are required — otherwise the
// doctor would have no bookable day at all.
const TIME_RE = /^\d{2}:\d{2}$/;

const validateScheduleArray = (scheduleArray) => {
  if (!scheduleArray.some((d) => !d.isOff)) {
    throw new ApiError(400, 'At least one working day is required');
  }
  for (const day of scheduleArray) {
    if (day.isOff) continue;
    if (day.endTime <= day.startTime) {
      throw new ApiError(400, `End time must be after start time (day ${day.dayOfWeek})`);
    }
    const hasBreak = day.breakStartTime && day.breakEndTime;
    if (hasBreak) {
      if (day.breakEndTime <= day.breakStartTime) {
        throw new ApiError(400, `Break end time must be after break start time (day ${day.dayOfWeek})`);
      }
      if (day.breakStartTime < day.startTime || day.breakEndTime > day.endTime) {
        throw new ApiError(400, `Break time must be inside working hours (day ${day.dayOfWeek})`);
      }
    }
  }
};

export const updateDoctorSchedule = async (doctorId, scheduleArray) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  validateScheduleArray(scheduleArray);

  const ops = scheduleArray.map(({ dayOfWeek, startTime, endTime, breakStartTime, breakEndTime, slotDuration, isOff }) =>
    WorkSchedule.findOneAndUpdate(
      { doctorId, dayOfWeek },
      {
        doctorId, dayOfWeek, startTime, endTime, slotDuration, isOff,
        breakStartTime: breakStartTime || '',
        breakEndTime:   breakEndTime || '',
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )
  );

  const updated = await Promise.all(ops);
  return updated.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
};

// ─── Availability ─────────────────────────────────────────────────────────────

// Delegates to appointments.service.js's getPublicSlots — the single source of
// truth for slot computation (UTC day handling, past-time buffer, break time,
// ACTIVE_APPOINTMENT_STATUSES) — instead of keeping a second, divergent copy of
// the same logic here. Response is reshaped to preserve this route's existing
// (currently unused by any frontend) contract.
export const getDoctorAvailability = async (doctorId, dateStr) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const { getPublicSlots } = await import('../appointments/appointments.service.js');
  const result = await getPublicSlots(doctorId, dateStr);

  const date = new Date(`${dateStr}T12:00:00.000Z`);
  const dayOfWeek = Number.isNaN(date.getTime()) ? null : date.getUTCDay();
  const schedule = dayOfWeek !== null ? await WorkSchedule.findOne({ doctorId, dayOfWeek }) : null;

  return {
    available: result.available,
    date: result.date,
    dayOfWeek,
    reason: result.reason,
    workHours: schedule ? { start: schedule.startTime, end: schedule.endTime } : null,
    slotDuration: schedule?.slotDuration ?? null,
    slots: result.slots,
  };
};

// ─── Admin one-step doctor creation ──────────────────────────────────────────

export const adminCreateDoctor = async ({ fullName, email, specialization, experience, bio, departmentId, consultationFee, order }, imageFile) => {
  if (!fullName?.trim())       throw new ApiError(400, 'Ad Soyad tələb olunur');
  if (!email?.trim())          throw new ApiError(400, 'E-poçt tələb olunur');
  if (!specialization?.trim()) throw new ApiError(400, 'İxtisas tələb olunur');
  const assignedDepartment = await resolveDepartment(departmentId);

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
  const uploadedImage = await uploadDoctorImage(imageFile);

  try {
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
      department:      assignedDepartment.name,
      departmentId:    assignedDepartment._id,
      consultationFee: Number(consultationFee) || 0,
      order:           Number(order) || 0,
      isActive:        true,
      isAvailable:     true,
      ...(uploadedImage && {
        image: uploadedImage.url,
        imagePublicId: uploadedImage.publicId,
      }),
    });

    await doctor.populate('userId', POPULATE_USER);
    await doctor.populate(POPULATE_DEPT);

    try {
      const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/daxil-ol`;
      await sendEmail({
        to:      email,
        subject: 'Hesabınız yaradıldı — Aslan Medical Center',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
            <h2 style="color:#1a1a2e">Xoş gəlmisiniz, Dr. ${fullName}</h2>
            <p>Aslan Medical Center sistemində sizin üçün həkim hesabı yaradıldı. Daxil olmaq üçün məlumatlarınız:</p>
            <p style="margin:4px 0"><strong>E-poçt:</strong> ${email}</p>
            <p style="margin:4px 0"><strong>Müvəqqəti şifrə:</strong> <span style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#1a1a2e">${autoPassword}</span></p>
            <p>Zəhmət olmasa ilk daxil olduqdan sonra şifrənizi dəyişdirin.</p>
            <p style="margin:20px 0"><a href="${loginUrl}" style="display:inline-block;padding:10px 20px;background:#1D8B95;color:#fff;text-decoration:none;border-radius:6px">Sistemə daxil ol</a></p>
            <p style="color:#888;font-size:12px">Bu e-poçtu siz tələb etməmisinizsə, zəhmət olmasa administrator ilə əlaqə saxlayın.</p>
          </div>
        `,
      });
    } catch (err) {
      // Email failed (SMTP not configured or send error) — doctor account still created.
      logger.error(`Failed to send auto-password email to ${email}: ${err.message}`);
      logger.info(`[Doctor Created] ${fullName} | ${email} | Password: ${autoPassword} | License: ${licenseNumber}`);
    }

    return { doctor, autoPassword, licenseNumber };
  } catch (err) {
    await deleteDoctorImage(uploadedImage?.publicId);
    throw err;
  }
};
