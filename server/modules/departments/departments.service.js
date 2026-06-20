import Department from '../../models/Department.model.js';
import Doctor      from '../../models/Doctor.model.js';
import ApiError    from '../../utils/ApiError.js';

export const getPublic = (limit = 20) =>
  Department.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .limit(Math.min(50, parseInt(limit) || 20))
    .lean();

export const getAll = () =>
  Department.find({}).sort({ order: 1, createdAt: 1 }).lean();

export const getBySlug = async (slug) => {
  const doc = await Department.findOne({ slug, isActive: true }).lean();
  if (!doc) throw new ApiError(404, 'Department not found');
  return doc;
};

export const create = (data) => Department.create(data);

export const update = async (id, data) => {
  const doc = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Department not found');
  return doc;
};

// Soft-delete only — hard-deleting would orphan any Doctor.departmentId still
// pointing at this document. Deactivated departments are filtered out of
// getPublic()/getBySlug() above, so they immediately stop showing publicly.
export const remove = async (id) => {
  const doc = await Department.findById(id);
  if (!doc) throw new ApiError(404, 'Department not found');

  const assignedDoctors = await Doctor.countDocuments({ departmentId: id });
  if (assignedDoctors > 0) {
    throw new ApiError(
      400,
      `Bu şöbəyə ${assignedDoctors} həkim təyin olunub. Əvvəl həkimləri başqa şöbəyə keçirin və ya şöbəni deaktiv edin.`,
      [],
      '',
      'DEPARTMENT_HAS_ASSIGNED_DOCTORS',
    );
  }

  doc.isActive = false;
  await doc.save();
  return doc;
};
