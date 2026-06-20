import Equipment, { EQUIPMENT_STATUS } from '../../models/Equipment.model.js';
import SterilizationCycle from '../../models/SterilizationCycle.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';
import { nextSequence } from '../../models/Counter.model.js';

const STERILE_VALID_DAYS = 30;

// Manual/administrative transitions an operator can request directly via
// PATCH /equipment/:id/status. Sterilizing → sterile/dirty only ever happens
// through completeSterilization (success/failure), never here.
const EQUIPMENT_TRANSITIONS = Object.freeze({
  available:   ['in_use', 'maintenance', 'retired'],
  in_use:      ['dirty', 'maintenance'],
  dirty:       ['cleaning', 'maintenance'],
  cleaning:    ['dirty', 'maintenance'],
  sterilizing: [],
  sterile:     ['available', 'in_use', 'maintenance'],
  maintenance: ['available', 'retired'],
  retired:     [],
});

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const createEquipment = async (data) => {
  const existing = await Equipment.findOne({ code: data.code });
  if (existing) throw new ApiError(409, 'Equipment code already exists');
  return Equipment.create(data);
};

export const getEquipmentList = async ({ status, category, wardId, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};
  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (wardId)   filter.wardId   = wardId;

  const [equipment, total] = await Promise.all([
    Equipment.find(filter).populate('wardId', 'name').sort({ name: 1 }).skip(skip).limit(lim),
    Equipment.countDocuments(filter),
  ]);
  return { equipment, total, page: pg, limit: lim };
};

export const getEquipmentById = async (id) => {
  const equipment = await Equipment.findById(id).populate('wardId', 'name');
  if (!equipment) throw new ApiError(404, 'Equipment not found');
  return equipment;
};

export const updateEquipmentStatus = async (id, status, userId, req) => {
  if (!EQUIPMENT_STATUS.includes(status)) throw new ApiError(400, 'Invalid status');

  const equipment = await Equipment.findById(id);
  if (!equipment) throw new ApiError(404, 'Equipment not found');

  const allowed = EQUIPMENT_TRANSITIONS[equipment.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Cannot move equipment from '${equipment.status}' to '${status}'`);
  }

  equipment.status = status;
  await equipment.save();

  logAction({ userId, action: 'EQUIPMENT_STATUS_UPDATE', resourceType: 'Equipment', resourceId: equipment._id, description: `Equipment ${equipment.code} -> ${status}`, req });

  return equipment;
};

// Begins a sterilization cycle — only equipment that has just been cleaned
// may enter sterilizing, and the equipment is atomically claimed (status
// flip is conditional on still being 'cleaning') so two concurrent start
// requests can't both spin up a cycle for the same item.
export const startSterilization = async ({ equipmentId, method }, userId, req) => {
  const equipment = await Equipment.findOneAndUpdate(
    { _id: equipmentId, status: 'cleaning' },
    { $set: { status: 'sterilizing' } },
  );
  if (!equipment) {
    const exists = await Equipment.exists({ _id: equipmentId });
    if (!exists) throw new ApiError(404, 'Equipment not found');
    throw new ApiError(409, "Equipment must be in 'cleaning' status to start sterilization");
  }

  const seq = await nextSequence(`sterilization-${new Date().getFullYear()}`);
  const batchNumber = `STER-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;

  const cycle = await SterilizationCycle.create({
    equipmentId, batchNumber, method, performedBy: userId, startedAt: new Date(), status: 'in_progress',
  });

  await Equipment.findByIdAndUpdate(equipmentId, { currentCycleId: cycle._id });

  logAction({ userId, action: 'STERILIZATION_CYCLE_START', resourceType: 'SterilizationCycle', resourceId: cycle._id, description: `Started ${method} cycle ${batchNumber} for equipment ${equipmentId}`, req });

  return cycle;
};

export const completeSterilization = async (cycleId, { result, notes }, userId, req) => {
  if (!['completed', 'failed'].includes(result)) throw new ApiError(400, "result must be 'completed' or 'failed'");

  const cycle = await SterilizationCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, 'Sterilization cycle not found');
  if (cycle.status !== 'in_progress') throw new ApiError(400, `Cycle already ${cycle.status}`);

  cycle.status = result;
  cycle.completedAt = new Date();
  cycle.verifiedBy = userId;
  if (notes) cycle.notes = notes;
  await cycle.save();

  const equipment = await Equipment.findById(cycle.equipmentId);
  if (equipment) {
    if (result === 'completed') {
      equipment.status = 'sterile';
      equipment.lastSterilizedAt = cycle.completedAt;
      equipment.sterileExpiresAt = new Date(cycle.completedAt.getTime() + STERILE_VALID_DAYS * 24 * 60 * 60 * 1000);
    } else {
      // Failed cycle — equipment goes back to dirty, not sterile, so it
      // cannot be used until it's re-cleaned and re-sterilized.
      equipment.status = 'dirty';
    }
    equipment.currentCycleId = null;
    await equipment.save();
  }

  logAction({ userId, action: 'STERILIZATION_CYCLE_COMPLETE', resourceType: 'SterilizationCycle', resourceId: cycle._id, description: `Cycle ${cycle.batchNumber} ${result}`, req });

  return cycle;
};

export const getEquipmentCycles = async (equipmentId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const [cycles, total] = await Promise.all([
    SterilizationCycle.find({ equipmentId })
      .populate('performedBy', 'fullName')
      .populate('verifiedBy', 'fullName')
      .sort({ createdAt: -1 }).skip(skip).limit(lim),
    SterilizationCycle.countDocuments({ equipmentId }),
  ]);
  return { cycles, total, page: pg, limit: lim };
};

export const getDueForSterilization = async () => {
  const now = new Date();
  return Equipment.find({
    status: 'sterile',
    sterileExpiresAt: { $lte: now },
  }).sort({ sterileExpiresAt: 1 });
};
