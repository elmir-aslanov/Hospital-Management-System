import SiteDoctor from '../../models/SiteDoctor.model.js';
import ApiError    from '../../utils/ApiError.js';

// ── Public ────────────────────────────────────────────────────────────────────

export const getPublicDoctors = (limit = 8) => {
  const lim = Math.min(20, Math.max(1, parseInt(limit) || 8));
  return SiteDoctor.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(lim)
    .lean();
};

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export const getAllDoctors = () =>
  SiteDoctor.find({})
    .populate('userId', 'fullName name surname email photoUrl phone')
    .sort({ order: 1, createdAt: -1 })
    .lean();

export const createDoctor = (data) => SiteDoctor.create(data);

export const updateDoctor = async (id, data) => {
  const doc = await SiteDoctor.findByIdAndUpdate(id, data, {
    new: true, runValidators: true,
  });
  if (!doc) throw new ApiError(404, 'Doctor not found');
  return doc;
};

export const deleteDoctor = async (id) => {
  const doc = await SiteDoctor.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Doctor not found');
};
