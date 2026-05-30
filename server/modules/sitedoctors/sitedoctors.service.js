import Doctor   from '../../models/Doctor.model.js';
import ApiError from '../../utils/ApiError.js';

const POPULATE = 'fullName name surname email photoUrl phone';

// Public endpoints now served from Doctor collection
export const getPublicDoctors = async (limit = 8) => {
  const lim = Math.min(20, Math.max(1, parseInt(limit) || 8));
  return Doctor.find({ isActive: true, isAvailable: true })
    .populate('userId', POPULATE)
    .sort({ order: 1, averageRating: -1 })
    .limit(lim)
    .lean();
};

export const getAllDoctors = async () => {
  return Doctor.find({ isActive: true })
    .populate('userId', POPULATE)
    .sort({ order: 1, createdAt: -1 })
    .lean();
};

// Admin mutations still go through Doctor model
export const createDoctor = (data) => Doctor.create(data);

export const updateDoctor = async (id, data) => {
  const doc = await Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Doctor not found');
  return doc;
};

export const deleteDoctor = async (id) => {
  const doc = await Doctor.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!doc) throw new ApiError(404, 'Doctor not found');
};
