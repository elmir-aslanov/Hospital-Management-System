import Invoice from '../../models/Invoice.model.js';
import Payment from '../../models/Payment.model.js';
import ApiError from '../../utils/ApiError.js';

const POPULATE_PATIENT = { path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } };
const POPULATE_ISSUER  = { path: 'issuedBy', select: 'fullName name surname' };

export const createInvoice = async (data, userId) => {
  const items = (data.items || []).map(i => ({
    description: String(i.description || '').trim(),
    serviceCode: i.serviceCode ? String(i.serviceCode).trim() : undefined,
    quantity:    Math.max(1, Number(i.quantity) || 1),
    unitPrice:   Math.max(0, Number(i.unitPrice) || 0),
    total:       Math.max(0, Number(i.unitPrice) * Math.max(1, Number(i.quantity) || 1)),
  }));
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discount = Math.max(0, Number(data.discount) || 0);
  const tax      = Math.max(0, Number(data.tax) || 0);
  const total    = Math.max(0, subtotal - discount + tax);
  const invoice  = await Invoice.create({
    patientId:     data.patientId,
    visitId:       data.visitId   || undefined,
    appointmentId: data.appointmentId || undefined,
    issuedBy:      userId,
    items,
    subtotal,
    discount,
    tax,
    total,
    currency:    data.currency  || 'AZN',
    status:      data.status    || 'draft',
    dueDate:     data.dueDate   || undefined,
    notes:       data.notes     || undefined,
    insuranceId: data.insuranceId || undefined,
  });
  return invoice.populate([POPULATE_PATIENT, POPULATE_ISSUER]);
};

export const getInvoices = async ({ patientId, status, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (patientId) filter.patientId = patientId;
  if (status)    filter.status    = status;
  const pg   = Math.max(1, parseInt(page));
  const lim  = Math.min(100, parseInt(limit));
  const skip = (pg - 1) * lim;
  const [invoices, total] = await Promise.all([
    Invoice.find(filter).populate([POPULATE_PATIENT, POPULATE_ISSUER])
      .sort({ createdAt: -1 }).skip(skip).limit(lim),
    Invoice.countDocuments(filter),
  ]);
  return { invoices, total, page: pg, limit: lim };
};

export const getInvoiceById = async (id) => {
  const inv = await Invoice.findById(id).populate([POPULATE_PATIENT, POPULATE_ISSUER]);
  if (!inv) throw new ApiError(404, 'Invoice not found');
  return inv;
};

export const updateInvoiceStatus = async (id, status) => {
  const inv = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
  if (!inv) throw new ApiError(404, 'Invoice not found');
  return inv;
};

export const addPayment = async ({ invoiceId, amount, method, transactionId, note }, userId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.status === 'cancelled') throw new ApiError(400, 'Cannot pay a cancelled invoice');

  const payment = await Payment.create({
    invoiceId, patientId: invoice.patientId,
    amount, method, transactionId, note, receivedBy: userId,
  });

  const totalPaid = await Payment.aggregate([
    { $match: { invoiceId: invoice._id, status: 'completed' } },
    { $group: { _id: null, sum: { $sum: '$amount' } } },
  ]);
  const paid = totalPaid[0]?.sum || 0;

  if (paid >= invoice.total) {
    invoice.status = 'paid';
  } else if (paid > 0) {
    invoice.status = 'partially_paid';
  }
  await invoice.save();
  return payment;
};

export const getPatientPayments = async (patientId) => {
  return Payment.find({ patientId }).sort({ createdAt: -1 }).populate('invoiceId', 'invoiceNumber total');
};

export const getBillingSummary = async () => {
  const [byStatus, totalRevenue, todayRevenue] = await Promise.all([
    Invoice.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }]),
    Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]),
  ]);
  return {
    byStatus,
    totalRevenue: totalRevenue[0]?.sum || 0,
    todayRevenue: todayRevenue[0]?.sum || 0,
  };
};
