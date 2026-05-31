import mongoose from 'mongoose';
import DoctorRating from '../../models/DoctorRating.model.js';
import Doctor from '../../models/Doctor.model.js';
import Appointment from '../../models/Appointment.model.js';
import ApiError from '../../utils/ApiError.js';

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

const recalculateDoctorRating = async (doctorId) => {
  const stats = await DoctorRating.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg   = stats[0]?.avg   ?? 0;
  const count = stats[0]?.count ?? 0;
  await Doctor.findByIdAndUpdate(doctorId, {
    averageRating: Math.round(avg * 10) / 10,
    totalRatings:  count,
  });
};

export const createRating = async ({ doctorId, patientId, appointmentId, rating, review, isAnonymous }) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  if (appointment.status !== 'completed') throw new ApiError(400, 'Can only rate completed appointments');
  if (String(appointment.patientId) !== String(patientId)) throw new ApiError(403, 'Appointment does not belong to you');
  if (String(appointment.doctorId) !== String(doctorId)) throw new ApiError(400, 'Doctor mismatch');

  const existing = await DoctorRating.findOne({ appointmentId });
  if (existing) throw new ApiError(409, 'Already rated this appointment');

  const ratingDoc = await DoctorRating.create({ doctorId, patientId, appointmentId, rating, review, isAnonymous });
  await recalculateDoctorRating(doctorId);
  return ratingDoc;
};

export const getDoctorRatings = async (doctorId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);

  const [ratings, total, doctor] = await Promise.all([
    DoctorRating.find({ doctorId })
      .sort({ createdAt: -1 }).skip(skip).limit(lim)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } }),
    DoctorRating.countDocuments({ doctorId }),
    Doctor.findById(doctorId).select('averageRating totalRatings'),
  ]);

  // Hide identity for anonymous reviews
  const sanitized = ratings.map((r) => {
    const obj = r.toObject();
    if (obj.isAnonymous) obj.patientId = null;
    return obj;
  });

  // Rating distribution
  const dist = await DoctorRating.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  dist.forEach(({ _id, count }) => { distribution[_id] = count; });

  return {
    ratings: sanitized,
    averageRating: doctor?.averageRating ?? 0,
    totalRatings:  doctor?.totalRatings  ?? 0,
    distribution,
    total, page: pg, limit: lim,
  };
};

export const getAllRatings = async ({ doctorId, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (doctorId) filter.doctorId = doctorId;
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, parseInt(limit));
  const [ratings, total] = await Promise.all([
    DoctorRating.find(filter)
      .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization averageRating' })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
      .sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    DoctorRating.countDocuments(filter),
  ]);
  return { ratings, total, page: pg, limit: lim };
};

export const getMyRatings = async (patientId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const [ratings, total] = await Promise.all([
    DoctorRating.find({ patientId })
      .sort({ createdAt: -1 }).skip(skip).limit(lim)
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization averageRating' }),
    DoctorRating.countDocuments({ patientId }),
  ]);
  return { ratings, total, page: pg, limit: lim };
};
