import Operation from '../../models/Operation.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';

const ACTIVE_OPERATION_STATUSES = ['scheduled', 'in_progress'];

const OPERATION_TRANSITIONS = Object.freeze({
  scheduled:   ['in_progress', 'cancelled', 'postponed'],
  in_progress: ['completed'],
  postponed:   ['scheduled', 'cancelled'],
  completed:   [],
  cancelled:   [],
});

// Same pattern as the appointment slot lock — a per-process queue keyed by
// surgeon+day so two near-simultaneous schedule requests for the same
// surgeon never both pass the overlap check before either is committed.
const operationLocks = new Map();
const withSurgeonDayLock = async (surgeonId, dateString, operation) => {
  const key = `${surgeonId}:${dateString}`;
  const previous = operationLocks.get(key) || Promise.resolve();
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const tail = previous.then(() => gate);
  operationLocks.set(key, tail);
  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (operationLocks.get(key) === tail) operationLocks.delete(key);
  }
};

const getUtcDayRange = (date) => {
  const dateString = typeof date === 'string' ? date.slice(0, 10) : new Date(date).toISOString().slice(0, 10);
  const dayStart = new Date(`${dateString}T00:00:00.000Z`);
  const dayEnd   = new Date(`${dateString}T23:59:59.999Z`);
  if (Number.isNaN(dayStart.getTime())) throw new ApiError(400, 'Invalid date');
  return { dateString, dayStart, dayEnd };
};

const addMinutes = (hhmm, minutes) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
};

const assertNotPastDate = (dayStart) => {
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  if (dayStart.getTime() < todayStart.getTime()) {
    throw new ApiError(400, 'Cannot schedule an operation in the past');
  }
};

const assertSurgeonAvailable = async ({ surgeonId, dayStart, dayEnd, startTime, endTime, excludeId }) => {
  // Mongo can't compare startTime+duration directly without $expr; fetch the
  // surgeon's same-day operations and check overlap in application code —
  // volumes here are small (a handful of operations/surgeon/day).
  const sameDay = await Operation.find({
    surgeonId, date: { $gte: dayStart, $lte: dayEnd }, status: { $in: ACTIVE_OPERATION_STATUSES },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  const overlaps = sameDay.some((op) => {
    const opEnd = addMinutes(op.startTime, op.estimatedDurationMinutes);
    return op.startTime < endTime && opEnd > startTime;
  });
  if (overlaps) throw new ApiError(409, 'Surgeon already has an operation scheduled at this time');
};

export const createOperation = async (data, userId, req) => {
  const { patientId, surgeonId, assistingDoctorIds, anesthesiologistId, procedureName, room, priority, date, startTime, estimatedDurationMinutes } = data;

  const [patient, surgeon] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(surgeonId),
  ]);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (!surgeon) throw new ApiError(404, 'Surgeon not found');

  const { dateString, dayStart, dayEnd } = getUtcDayRange(date);
  assertNotPastDate(dayStart);
  const endTime = addMinutes(startTime, estimatedDurationMinutes);

  const operation = await withSurgeonDayLock(surgeonId, dateString, async () => {
    await assertSurgeonAvailable({ surgeonId, dayStart, dayEnd, startTime, endTime });
    return Operation.create({
      patientId, surgeonId, assistingDoctorIds, anesthesiologistId, procedureName, room, priority,
      date: dayStart, startTime, estimatedDurationMinutes, createdBy: userId,
    });
  });

  logAction({ userId, action: 'OPERATION_SCHEDULE', resourceType: 'Operation', resourceId: operation._id, description: `Scheduled ${procedureName} for patient ${patientId}`, req });

  return populate(Operation.findById(operation._id));
};

const populate = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
    .populate({ path: 'surgeonId', populate: { path: 'userId', select: 'fullName' } })
    .populate({ path: 'assistingDoctorIds', populate: { path: 'userId', select: 'fullName' } })
    .populate({ path: 'anesthesiologistId', populate: { path: 'userId', select: 'fullName' } });

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const getOperations = async ({ status, surgeonId, patientId, date, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};
  if (status)    filter.status    = status;
  if (surgeonId) filter.surgeonId = surgeonId;
  if (patientId) filter.patientId = patientId;
  if (date) {
    const { dayStart, dayEnd } = getUtcDayRange(date);
    filter.date = { $gte: dayStart, $lte: dayEnd };
  }
  const [operations, total] = await Promise.all([
    populate(Operation.find(filter)).sort({ date: 1, startTime: 1 }).skip(skip).limit(lim),
    Operation.countDocuments(filter),
  ]);
  return { operations, total, page: pg, limit: lim };
};

export const getOperationById = async (id) => {
  const operation = await populate(Operation.findById(id));
  if (!operation) throw new ApiError(404, 'Operation not found');
  return operation;
};

export const updateOperationStatus = async (id, { status, reason, postOpNotes }, userId, req) => {
  const operation = await Operation.findById(id);
  if (!operation) throw new ApiError(404, 'Operation not found');

  const allowed = OPERATION_TRANSITIONS[operation.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Cannot move operation from '${operation.status}' to '${status}'`);
  }

  operation.status = status;
  if (status === 'cancelled')  operation.cancelReason = reason || '';
  if (status === 'postponed')  operation.postponeReason = reason || '';
  if (status === 'completed' && postOpNotes) operation.postOpNotes = postOpNotes;
  await operation.save();

  logAction({ userId, action: 'OPERATION_STATUS_UPDATE', resourceType: 'Operation', resourceId: operation._id, description: `Operation ${id} -> ${status}`, req });

  return populate(Operation.findById(operation._id));
};

export const rescheduleOperation = async (id, { date, startTime, estimatedDurationMinutes }, userId, req) => {
  const operation = await Operation.findById(id);
  if (!operation) throw new ApiError(404, 'Operation not found');
  if (!['scheduled', 'postponed'].includes(operation.status)) {
    throw new ApiError(400, `Cannot reschedule an operation with status '${operation.status}'`);
  }

  const { dateString, dayStart, dayEnd } = getUtcDayRange(date);
  assertNotPastDate(dayStart);
  const duration = estimatedDurationMinutes || operation.estimatedDurationMinutes;
  const endTime = addMinutes(startTime, duration);

  await withSurgeonDayLock(operation.surgeonId, dateString, async () => {
    await assertSurgeonAvailable({ surgeonId: operation.surgeonId, dayStart, dayEnd, startTime, endTime, excludeId: id });
    operation.date = dayStart;
    operation.startTime = startTime;
    operation.estimatedDurationMinutes = duration;
    operation.status = 'scheduled';
    await operation.save();
  });

  logAction({ userId, action: 'OPERATION_RESCHEDULE', resourceType: 'Operation', resourceId: operation._id, description: `Operation ${id} rescheduled to ${dateString} ${startTime}`, req });

  return populate(Operation.findById(operation._id));
};
