import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Patient from '../../models/Patient.model.js';
import User from '../../models/User.model.js';

export const searchPatients = asyncHandler(async (req, res) => {
  const { query, condition, page = 1, limit = 10 } = req.query;

  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  const filter = {};

  // Name search: find matching User _ids first, then filter Patient by userId
  if (query) {
    const regex = new RegExp(query, 'i');
    const matchedUsers = await User.find({ fullName: regex }).select('_id');
    const userIds = matchedUsers.map((u) => u._id);

    filter.$or = [
      { userId:    { $in: userIds } },
      { patientId: { $regex: query, $options: 'i' } },
    ];
  }

  if (condition) {
    const condRegex = { $regex: condition, $options: 'i' };
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { 'medicalHistory.condition': condRegex },
        { chronicConditions: condRegex },
      ],
    });
  }

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Patient.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { patients, total, page: pg, limit: lim, query: query || null, condition: condition || null })
  );
});
