import Ward from '../../models/Ward.model.js';
import Bed from '../../models/Bed.model.js';
import ApiError from '../../utils/ApiError.js';
import { BED_STATUS } from '../../config/constants.js';

export const createWard = async (data) => Ward.create(data);

export const getWards = async () => {
  const wards = await Ward.find().sort({ name: 1 });

  // Attach live bed stats per ward
  const withStats = await Promise.all(
    wards.map(async (ward) => {
      const [total, available] = await Promise.all([
        Bed.countDocuments({ wardId: ward._id }),
        Bed.countDocuments({ wardId: ward._id, status: BED_STATUS.AVAILABLE }),
      ]);
      return { ...ward.toObject(), bedStats: { total, available, occupied: total - available } };
    })
  );

  return withStats;
};

export const getWardById = async (id) => {
  const ward = await Ward.findById(id);
  if (!ward) throw new ApiError(404, 'Ward not found');
  return ward;
};

export const getBedsByWard = async (wardId) => {
  return Bed.find({ wardId }).populate('currentPatientId', 'patientId').sort({ bedNumber: 1 });
};

export const updateBedStatus = async (wardId, bedId, status, patientId = null) => {
  const bed = await Bed.findOne({ _id: bedId, wardId });
  if (!bed) throw new ApiError(404, 'Bed not found in this ward');

  if (status === BED_STATUS.OCCUPIED && bed.status !== BED_STATUS.AVAILABLE) {
    throw new ApiError(409, 'Bed is not available');
  }

  bed.status = status;
  bed.currentPatientId = status === BED_STATUS.AVAILABLE ? null : patientId;
  await bed.save();
  return bed;
};
