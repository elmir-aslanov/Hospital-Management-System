import Doctor     from '../../models/Doctor.model.js';
import Patient    from '../../models/Patient.model.js';
import Department from '../../models/Department.model.js';
import User       from '../../models/User.model.js';

export const searchPatients = async ({ query, condition, page = 1, limit = 10 }) => {
  const pg   = Math.max(1, parseInt(page));
  const lim  = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  const filter = {};

  if (query) {
    const regex        = new RegExp(query, 'i');
    const matchedUsers = await User.find({ fullName: regex }).select('_id');
    const userIds      = matchedUsers.map((u) => u._id);

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

  return { patients, total, page: pg, limit: lim, query: query || null, condition: condition || null };
};

export const globalSearch = async (query, limit = 10) => {
  if (!query || query.trim().length < 2) return { doctors: [], patients: [], departments: [] };

  const q   = query.trim();
  const regex = { $regex: q, $options: 'i' };
  const lim = Math.min(20, parseInt(limit) || 10);

  const [doctors, patients, departments] = await Promise.all([
    Doctor.find({ $or: [{ specialization: regex }] })
      .populate('userId', 'fullName name surname email photoUrl')
      .limit(lim).lean(),
    Patient.find({ patientId: regex })
      .populate('userId', 'fullName name surname email phone')
      .limit(lim).lean(),
    Department.find({ $or: [{ name: regex }, { slug: regex }], isActive: true })
      .limit(lim).lean(),
  ]);

  return { doctors, patients, departments };
};
