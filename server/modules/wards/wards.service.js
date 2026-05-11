import Ward from '../../models/Ward.model.js';
import Room from '../../models/Room.model.js';
import Bed from '../../models/Bed.model.js';
import ApiError from '../../utils/ApiError.js';
import { BED_STATUS } from '../../config/constants.js';

// ─── Bed stats helper ─────────────────────────────────────────────────────────

const getBedStats = async (wardId) => {
  const agg = await Bed.aggregate([
    { $match: { wardId: wardId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const stats = { total: 0, available: 0, occupied: 0, maintenance: 0, reserved: 0 };
  for (const { _id, count } of agg) {
    stats[_id] = count;
    stats.total += count;
  }
  return stats;
};

// ─── Ward ─────────────────────────────────────────────────────────────────────

export const createWard = async (data) => {
  const existing = await Ward.findOne({ name: data.name });
  if (existing) throw new ApiError(409, 'Ward name already exists');
  return Ward.create(data);
};

export const getWards = async () => {
  const wards = await Ward.find().sort({ floor: 1, name: 1 });
  return Promise.all(
    wards.map(async (ward) => ({
      ...ward.toObject(),
      bedStats: await getBedStats(ward._id),
    }))
  );
};

export const getWardById = async (wardId) => {
  const ward = await Ward.findById(wardId);
  if (!ward) throw new ApiError(404, 'Ward not found');
  return { ...ward.toObject(), bedStats: await getBedStats(ward._id) };
};

export const getWardStats = async () => {
  const agg = await Bed.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const result = { totalBeds: 0, availableBeds: 0, occupiedBeds: 0, maintenanceBeds: 0, reservedBeds: 0 };
  for (const { _id, count } of agg) {
    result.totalBeds += count;
    if (_id === BED_STATUS.AVAILABLE)   result.availableBeds   = count;
    if (_id === BED_STATUS.OCCUPIED)    result.occupiedBeds    = count;
    if (_id === BED_STATUS.MAINTENANCE) result.maintenanceBeds = count;
    if (_id === BED_STATUS.RESERVED)    result.reservedBeds    = count;
  }
  return result;
};

// ─── Room ─────────────────────────────────────────────────────────────────────

export const createRoom = async (data) => {
  const ward = await Ward.findById(data.wardId);
  if (!ward) throw new ApiError(404, 'Ward not found');

  const duplicate = await Room.findOne({ wardId: data.wardId, roomNumber: data.roomNumber });
  if (duplicate) throw new ApiError(409, 'Room number already exists in this ward');

  return Room.create(data);
};

export const getRoomsByWard = async (wardId) => {
  const rooms = await Room.find({ wardId }).sort({ roomNumber: 1 });
  return Promise.all(
    rooms.map(async (room) => ({
      ...room.toObject(),
      beds: await Bed.find({ roomId: room._id }).sort({ bedNumber: 1 }),
    }))
  );
};

// ─── Bed ──────────────────────────────────────────────────────────────────────

export const createBed = async (data) => {
  const [room, ward] = await Promise.all([
    Room.findById(data.roomId),
    Ward.findById(data.wardId),
  ]);
  if (!room) throw new ApiError(404, 'Room not found');
  if (!ward) throw new ApiError(404, 'Ward not found');

  const duplicate = await Bed.findOne({ roomId: data.roomId, bedNumber: data.bedNumber });
  if (duplicate) throw new ApiError(409, 'Bed number already exists in this room');

  return Bed.create(data);
};

export const getBedsByWard = async (wardId) => {
  return Bed.find({ wardId })
    .populate('roomId', 'roomNumber type')
    .populate({ path: 'currentPatientId', populate: { path: 'userId', select: 'fullName' } })
    .sort({ bedNumber: 1 });
};

export const updateBedStatus = async (bedId, status, patientId = null) => {
  const bed = await Bed.findById(bedId);
  if (!bed) throw new ApiError(404, 'Bed not found');

  if (status === BED_STATUS.OCCUPIED) {
    if (bed.status !== BED_STATUS.AVAILABLE) {
      throw new ApiError(409, 'Bed is not available');
    }
    bed.currentPatientId = patientId;
  }

  if (status === BED_STATUS.AVAILABLE) {
    bed.currentPatientId = null;
  }

  bed.status = status;
  await bed.save();
  return bed.populate('roomId', 'roomNumber');
};
