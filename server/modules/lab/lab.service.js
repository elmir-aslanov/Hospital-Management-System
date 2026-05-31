import LabOrder  from '../../models/LabOrder.model.js';
import LabResult from '../../models/LabResult.model.js';
import ApiError  from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';

const POP_PATIENT = { path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } };
const POP_DOCTOR  = { path: 'doctorId',  populate: { path: 'userId', select: 'fullName' } };
const POP_PERF    = { path: 'performedBy', select: 'fullName name surname' };

// ── Orders ───────────────────────────────────────────────────
export const createOrder = async (data, doctorId) => {
  const order = await LabOrder.create({ ...data, doctorId });
  try { logAction({ userId: doctorId, action: 'CREATE_LAB_ORDER', resourceType: 'LabOrder', resourceId: order._id, description: `Lab order ${order.orderNumber} created` }); } catch (_) {}
  return order.populate([POP_PATIENT, POP_DOCTOR]);
};

export const getOrders = async ({ status, patientId, doctorId, priority, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status)    filter.status    = status;
  if (patientId) filter.patientId = patientId;
  if (doctorId)  filter.doctorId  = doctorId;
  if (priority)  filter.priority  = priority;
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, parseInt(limit));
  const [orders, total] = await Promise.all([
    LabOrder.find(filter).populate([POP_PATIENT, POP_DOCTOR]).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    LabOrder.countDocuments(filter),
  ]);
  return { orders, total, page: pg, limit: lim };
};

export const getOrderById = async (id) => {
  const order = await LabOrder.findById(id).populate([POP_PATIENT, POP_DOCTOR]);
  if (!order) throw new ApiError(404, 'Lab order not found');
  return order;
};

export const updateOrderStatus = async (id, status) => {
  const order = await LabOrder.findById(id);
  if (!order) throw new ApiError(404, 'Lab order not found');
  const allowed = {
    pending:          ['sample_collected', 'cancelled'],
    sample_collected: ['processing', 'cancelled'],
    processing:       ['completed', 'cancelled'],
    completed:        [],
    cancelled:        [],
  };
  if (!allowed[order.status]?.includes(status)) {
    throw new ApiError(400, `Cannot transition from '${order.status}' to '${status}'`);
  }
  order.status = status;
  await order.save();
  return order;
};

export const deleteOrder = async (id) => {
  const order = await LabOrder.findById(id);
  if (!order) throw new ApiError(404, 'Lab order not found');
  if (!['pending', 'cancelled'].includes(order.status)) {
    throw new ApiError(400, 'Only pending or cancelled orders can be deleted');
  }
  await LabOrder.findByIdAndDelete(id);
  return order;
};

// ── Results ──────────────────────────────────────────────────
export const createResult = async (data, userId) => {
  const order = await LabOrder.findById(data.labOrderId);
  if (!order) throw new ApiError(404, 'Lab order not found');
  if (order.status === 'cancelled') throw new ApiError(400, 'Cannot add result to cancelled order');
  const existing = await LabResult.findOne({ labOrderId: data.labOrderId });
  if (existing) throw new ApiError(409, 'Result already exists for this order. Use update instead.');
  const result = await LabResult.create({ ...data, patientId: order.patientId, performedBy: userId });
  order.status = 'completed';
  await order.save();
  try { logAction({ userId, action: 'CREATE_LAB_RESULT', resourceType: 'LabResult', resourceId: result._id, description: `Result entered for order ${data.labOrderId}` }); } catch (_) {}
  return result.populate([POP_PERF]);
};

export const getResultByOrder = async (labOrderId) => {
  const result = await LabResult.findOne({ labOrderId }).populate(POP_PERF);
  if (!result) throw new ApiError(404, 'No result found for this order');
  return result;
};

export const getPatientResults = async (patientId) =>
  LabResult.find({ patientId }).sort({ createdAt: -1 })
    .populate('labOrderId', 'orderNumber tests')
    .populate(POP_PERF);

export const verifyResult = async (resultId, userId) => {
  const result = await LabResult.findById(resultId);
  if (!result) throw new ApiError(404, 'Result not found');
  result.isVerified = true;
  result.verifiedBy = userId;
  result.verifiedAt = new Date();
  await result.save();
  try { logAction({ userId, action: 'VERIFY_LAB_RESULT', resourceType: 'LabResult', resourceId: resultId, description: 'Lab result verified' }); } catch (_) {}
  return result;
};

export const getLabSummary = async () => {
  const [byStatus, todayOrders] = await Promise.all([
    LabOrder.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    LabOrder.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
  ]);
  return { byStatus, todayOrders };
};
