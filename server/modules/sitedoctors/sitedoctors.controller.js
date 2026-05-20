import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import Doctor       from '../../models/Doctor.model.js';

export const getPublicDoctors = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const doctors = await Doctor.find({ isAvailable: true })
    .populate('userId', 'fullName email avatar phone')
    .sort({ averageRating: -1, experience: -1 })
    .limit(limit)
    .lean();

  const mapped = doctors.map(doc => ({
    _id:            doc._id,
    name:           doc.userId?.fullName || 'Həkim',
    fullName:       doc.userId?.fullName || 'Həkim',
    specialty:      doc.specialization,
    specialization: doc.specialization,
    department:     doc.specialization,
    experience:     doc.experience,
    bio:            doc.bio,
    image:          doc.userId?.avatar || '',
    averageRating:  doc.averageRating,
    totalRatings:   doc.totalRatings,
    isAvailable:    doc.isAvailable,
    isActive:       doc.isAvailable,
  }));

  res.json(new ApiResponse(200, { doctors: mapped, total: mapped.length }, 'Həkimlər uğurla alındı.'));
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .populate('userId', 'fullName email avatar')
    .sort({ createdAt: -1 })
    .lean();
  res.json(new ApiResponse(200, doctors));
});

export const createDoctor  = asyncHandler(async (_req, res) => res.status(405).json(new ApiResponse(405, null, 'Use /api/v1/doctors to manage HMS doctors.')));
export const updateDoctor  = asyncHandler(async (_req, res) => res.status(405).json(new ApiResponse(405, null, 'Use /api/v1/doctors to manage HMS doctors.')));
export const deleteDoctor  = asyncHandler(async (_req, res) => res.status(405).json(new ApiResponse(405, null, 'Use /api/v1/doctors to manage HMS doctors.')));
