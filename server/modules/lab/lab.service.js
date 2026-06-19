import mongoose  from 'mongoose';
import jwt       from 'jsonwebtoken';
import crypto    from 'crypto';
import LabOrder  from '../../models/LabOrder.model.js';
import LabResult from '../../models/LabResult.model.js';
import PriceList from '../../models/PriceList.model.js';
import Patient   from '../../models/Patient.model.js';
import User      from '../../models/User.model.js';
import ApiError  from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';
import logger     from '../../utils/logger.js';
import { uploadBuffer } from '../../config/cloudinary.js';
import { createLabResultPDF } from '../../utils/generateLabResultPdf.js';
import { nextSequence } from '../../models/Counter.model.js';

const POP_PATIENT = { path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } };
const POP_DOCTOR  = { path: 'doctorId',  populate: { path: 'userId', select: 'fullName' } };
const POP_PERF    = { path: 'performedBy', select: 'fullName name surname' };
const POP_PUBLIC_PATIENT = { path: 'patientId', select: 'userId', populate: { path: 'userId', select: 'fullName name surname sexiyyatId birthDate' } };
const POP_PUBLIC_DOCTOR  = { path: 'doctorId', select: 'userId specialization', populate: { path: 'userId', select: 'fullName name surname' } };
const POP_MANUAL = [
  { path: 'labTechnicianId', select: 'fullName name surname' },
  { path: 'approvedBy',      select: 'fullName name surname' },
];

const trim = (value) => String(value || '').trim();
const escapeRegex = (value) => trim(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = (value) => trim(value).toUpperCase();
const normalizeName = (value) => trim(value).toUpperCase().replace(/\s+/g, ' ');

const displayName = (user) => {
  if (!user) return '';
  const name = [user.name, user.surname].filter(Boolean).join(' ').trim();
  return name || user.fullName || '';
};

const maskName = (user) => {
  const full = displayName(user);
  if (!full) return 'Pasiyent';
  return full.split(/\s+/).filter(Boolean).map(word => `${word.charAt(0).toUpperCase()}***`).join(' ');
};

const FIN_REGEX = /^[A-Za-z0-9]{7}$/;

const parseDateInput = (value, fieldName) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, fieldName || 'Məlumatları düzgün doldurun');
  }
  return date;
};

const sameDate = (left, right) => {
  if (!left || !right) return false;
  return new Date(left).toISOString().slice(0, 10) === right;
};

const publicResultPayload = (order, result) => {
  const patientUser = order.patientId?.userId;
  const doctorUser = order.doctorId?.userId;
  const tests = Array.isArray(order.tests) ? order.tests : [];
  const analysisName = tests.map(test => test.testName).filter(Boolean).join(', ') || 'Laborator analiz';
  const resultDate = result.verifiedAt || result.createdAt || order.updatedAt || order.createdAt;

  return {
    patientFullName: displayName(patientUser) || 'Pasiyent',
    protocol: order.orderNumber,
    resultDate,
    doctorName: displayName(doctorUser),
    labName: 'Aslan Medical Laboratoriya',
    analysisName,
    status: result.isVerified ? 'Təsdiqlənib' : 'Hazırdır',
    summary: result.summary || '',
    results: (result.results || []).map(item => ({
      name: item.testName,
      testName: item.testName,
      value: item.value,
      unit: item.unit || '',
      referenceRange: item.referenceRange || '',
      status: item.status || 'normal',
      notes: item.notes || '',
    })),
    pdfUrl: result.attachmentUrl || '',
    fileUrl: result.attachmentUrl || '',
  };
};

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

export const updateOrderStatus = async (id, status, userId) => {
  const order = await LabOrder.findById(id);
  if (!order) throw new ApiError(404, 'Lab order not found');
  const allowed = {
    pending:          ['confirmed', 'sample_collected', 'cancelled'],
    confirmed:        ['sample_collected', 'cancelled'],
    sample_collected: ['processing', 'cancelled'],
    processing:       ['completed', 'cancelled'],
    completed:        ['cancelled'],
    approved:         [],
    cancelled:        [],
  };
  if (!allowed[order.status]?.includes(status)) {
    throw new ApiError(400, `Cannot transition from '${order.status}' to '${status}'`);
  }
  order.status = status;
  if (status === 'confirmed' && !order.confirmedAt) order.confirmedAt = new Date();
  if (status === 'completed' && !order.completedAt) order.completedAt = new Date();

  if (status === 'sample_collected' && order.source === 'public_self_request' && !order.sampleCollectedAt) {
    order.sampleCollectedAt = new Date();
    const existingResult = await LabResult.findOne({ labOrderId: order._id });
    if (!existingResult) {
      const patient = await Patient.findById(order.patientId).populate('userId', 'fullName name surname sexiyyatId birthDate');
      const user = patient?.userId;
      const priceList = order.priceListId ? await PriceList.findById(order.priceListId) : null;
      const year = new Date().getFullYear();
      const seq = await nextSequence(`labResultProtocol-${year}`);

      await LabResult.create({
        labOrderId: order._id,
        patientId: order.patientId,
        protocolNo: `LAB-${year}-${String(seq).padStart(6, '0')}`,
        patientFullName: displayUserName(user).slice(0, 150),
        patientFin: trim(user?.sexiyyatId).toUpperCase().slice(0, 8),
        patientBirthDate: user?.birthDate || null,
        sampleDate: order.sampleCollectedAt,
        testName: (priceList?.name || order.tests?.[0]?.testName || '').slice(0, 150),
        testCode: (priceList?.serviceCode || order.tests?.[0]?.testCode || '').slice(0, 40),
        labTechnicianId: userId,
        performedBy: userId,
        status: 'draft',
        isPublicVisible: false,
      });
    }
  }

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
  if (!order.completedAt) order.completedAt = new Date();
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

export const searchPublicResult = async ({
  searchType,
  fin,
  birthDate,
  protocol,
  startDate,
  endDate,
} = {}) => {
  const cleanSearchType = trim(searchType);
  const cleanFin = trim(fin);
  const cleanProtocol = trim(protocol);
  const cleanBirthDate = trim(birthDate);

  if (!['fin', 'birthDate'].includes(cleanSearchType)) {
    throw new ApiError(400, 'Məlumatları düzgün doldurun');
  }
  if (!cleanProtocol) {
    throw new ApiError(400, 'Protokol nömrəsi daxil edilməlidir');
  }
  if (cleanSearchType === 'fin' && !cleanFin) {
    throw new ApiError(400, 'FİN kod daxil edilməlidir');
  }
  if (cleanSearchType === 'birthDate' && !cleanBirthDate) {
    throw new ApiError(400, 'Doğum tarixi daxil edilməlidir');
  }

  const start = parseDateInput(startDate, 'Məlumatları düzgün doldurun');
  const end = parseDateInput(endDate, 'Məlumatları düzgün doldurun');
  if (start && end && start > end) {
    throw new ApiError(400, 'Başlanğıc tarix son tarixdən böyük ola bilməz');
  }

  const order = await LabOrder.findOne({
    orderNumber: new RegExp(`^${escapeRegex(cleanProtocol)}$`, 'i'),
    status: { $ne: 'cancelled' },
  }).populate([POP_PUBLIC_PATIENT, POP_PUBLIC_DOCTOR]);

  if (!order) {
    throw new ApiError(404, 'Daxil edilən məlumatlara uyğun analiz nəticəsi tapılmadı');
  }

  const patientUser = order.patientId?.userId;
  const matchesPatient = cleanSearchType === 'fin'
    ? normalize(patientUser?.sexiyyatId) === normalize(cleanFin)
    : sameDate(patientUser?.birthDate, cleanBirthDate);

  if (!matchesPatient) {
    throw new ApiError(404, 'Daxil edilən məlumatlara uyğun analiz nəticəsi tapılmadı');
  }

  const resultFilter = { labOrderId: order._id };
  if (start || end) {
    resultFilter.createdAt = {};
    if (start) resultFilter.createdAt.$gte = start;
    if (end) {
      const endOfDay = new Date(end);
      endOfDay.setUTCHours(23, 59, 59, 999);
      resultFilter.createdAt.$lte = endOfDay;
    }
  }

  const result = await LabResult.findOne(resultFilter).sort({ createdAt: -1 });
  if (!result) {
    throw new ApiError(404, 'Daxil edilən məlumatlara uyğun analiz nəticəsi tapılmadı');
  }

  return publicResultPayload(order, result);
};

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

// ── Public lookup ────────────────────────────────────────────
const GENERIC_NOT_FOUND = 'Məlumatlar uyğun gəlmədi və ya nəticə tapılmadı';

export const lookupPublicResult = async ({ fin, birthDate, protocolNo, startDate, endDate } = {}) => {
  const cleanProtocol = trim(protocolNo);
  const cleanFin = trim(fin);
  const cleanBirthDate = trim(birthDate);

  if (!cleanProtocol) {
    throw new ApiError(400, 'Protokol nömrəsi daxil edilməlidir');
  }
  if (!cleanFin && !cleanBirthDate) {
    throw new ApiError(400, 'FİN kod və ya doğum tarixi daxil edilməlidir');
  }
  if (cleanFin && !FIN_REGEX.test(cleanFin)) {
    throw new ApiError(400, 'FİN kod 7 simvoldan ibarət olmalıdır');
  }

  // Validate optional date range inputs (presence-only check; not used to filter)
  parseDateInput(startDate, 'Məlumatları düzgün doldurun');
  parseDateInput(endDate, 'Məlumatları düzgün doldurun');

  const order = await LabOrder.findOne({ protocolNo: cleanProtocol }).populate([POP_PUBLIC_PATIENT, POP_PUBLIC_DOCTOR]);

  if (!order) {
    throw new ApiError(404, GENERIC_NOT_FOUND);
  }

  const patientUser = order.patientId?.userId;
  const matches = cleanFin
    ? normalize(patientUser?.sexiyyatId) === normalize(cleanFin)
    : sameDate(patientUser?.birthDate, cleanBirthDate);

  if (!matches) {
    throw new ApiError(404, GENERIC_NOT_FOUND);
  }

  if (order.status !== 'completed') {
    return { status: 'pending', message: 'Nəticə hələ hazır deyil' };
  }

  const result = await LabResult.findOne({ labOrderId: order._id });
  const doctorUser = order.doctorId?.userId;

  return {
    status: 'completed',
    protocolNo: order.protocolNo,
    patientName: maskName(patientUser),
    orderDate: order.orderedAt || order.createdAt,
    completedAt: order.completedAt,
    doctorName: displayName(doctorUser),
    tests: (result?.results || []).map(item => ({
      testName: item.testName,
      value: item.value,
      unit: item.unit || '',
      referenceRange: item.referenceRange || '',
      flag: item.status || 'normal',
    })),
    summary: result?.summary || '',
    resultPdf: result?.attachmentUrl || order.resultPdf || null,
  };
};

// ── Result editing & attachments ────────────────────────────
export const updateResult = async (id, data, userId) => {
  const result = await LabResult.findById(id);
  if (!result) throw new ApiError(404, 'Result not found');

  if (Array.isArray(data.results)) result.results = data.results;
  if (data.summary !== undefined) result.summary = data.summary;

  await result.save();

  const order = await LabOrder.findById(result.labOrderId);
  if (order && order.status !== 'completed') {
    order.status = 'completed';
    if (!order.completedAt) order.completedAt = new Date();
    await order.save();
  }

  try { logAction({ userId, action: 'UPDATE_LAB_RESULT', resourceType: 'LabResult', resourceId: result._id, description: `Result updated for order ${result.labOrderId}` }); } catch (_) {}
  return result.populate([POP_PERF]);
};

// ── Manual / standalone certified results ───────────────────────
const PDF_TOKEN_PURPOSE = 'lab-result-pdf';
const PDF_TOKEN_TTL = '12m';
const NEW_FIN_REGEX = /^[A-Z0-9]{5,8}$/;
const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'LAB_TECHNICIAN', 'DOCTOR', 'BAS_HEKIM'];
const VERIFY_GENERIC_NOT_FOUND = 'Nəticə tapılmadı. Məlumatları yoxlayıb yenidən cəhd edin.';

const requireObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız identifikator');
};

const displayUserName = (user) => {
  if (!user) return '';
  const name = [user.name, user.surname].filter(Boolean).join(' ').trim();
  return name || user.fullName || '';
};

const sameCalendarDate = (left, rightStr) => {
  if (!left || !rightStr) return false;
  return new Date(left).toISOString().slice(0, 10) === rightStr;
};

const buildManualResultItems = (items) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    testName:       trim(item.parameterName ?? item.testName),
    value:          trim(item.value),
    unit:           trim(item.unit),
    referenceRange: trim(item.referenceRange),
    status:         ['normal', 'low', 'high', 'critical', 'pending'].includes(item.status) ? item.status : 'normal',
    note:           trim(item.note),
  }));

const maskFinForApi = (fin) => {
  const clean = trim(fin);
  if (!clean) return '';
  if (clean.length <= 3) return `${clean[0]}***`;
  return `${clean[0]}${'*'.repeat(clean.length - 3)}${clean.slice(-2)}`;
};

export const createManualResult = async (data, userId) => {
  const fullName = trim(data.patientFullName);
  const testName = trim(data.testName);
  if (!fullName) throw new ApiError(400, 'Pasiyentin ad və soyadı tələb olunur');
  if (!testName) throw new ApiError(400, 'Test adı tələb olunur');

  const status = ['draft', 'completed'].includes(data.status) ? data.status : 'completed';

  const result = await LabResult.create({
    patientFullName:   fullName.slice(0, 150),
    patientFin:         trim(data.patientFin).toUpperCase().slice(0, 8),
    patientBirthDate:   data.patientBirthDate ? new Date(data.patientBirthDate) : null,
    sampleDate:         data.sampleDate ? new Date(data.sampleDate) : null,
    resultDate:         data.resultDate ? new Date(data.resultDate) : null,
    doctorName:         trim(data.doctorName).slice(0, 150),
    departmentName:     trim(data.departmentName).slice(0, 150),
    testName:           testName.slice(0, 150),
    testCode:           trim(data.testCode).slice(0, 40),
    results:            buildManualResultItems(data.resultItems),
    generalConclusion:  trim(data.generalConclusion).slice(0, 2000),
    internalNote:       trim(data.internalNote).slice(0, 2000),
    labTechnicianId:    userId,
    performedBy:        userId,
    status,
    completedAt:        status === 'completed' ? new Date() : null,
    isPublicVisible:    false,
  });

  try {
    logAction({ userId, action: 'LAB_RESULT_CREATE_MANUAL', resourceType: 'LabResult', resourceId: result._id, description: `Manual lab result ${result.protocolNo} created` });
  } catch (_) {}

  return result.populate(POP_MANUAL);
};

export const updateManualResult = async (id, data, userId) => {
  requireObjectId(id);
  const result = await LabResult.findById(id);
  if (!result) throw new ApiError(404, 'Nəticə tapılmadı');
  if (result.status === 'cancelled') {
    throw new ApiError(400, "'Ləğv edildi' statuslu nəticə redaktə edilə bilməz");
  }

  const wasApproved = result.status === 'approved';

  if (data.patientFullName !== undefined)   result.patientFullName  = trim(data.patientFullName).slice(0, 150);
  if (data.patientFin !== undefined)        result.patientFin       = trim(data.patientFin).toUpperCase().slice(0, 8);
  if (data.patientBirthDate !== undefined)  result.patientBirthDate = data.patientBirthDate ? new Date(data.patientBirthDate) : null;
  if (data.sampleDate !== undefined)        result.sampleDate       = data.sampleDate ? new Date(data.sampleDate) : null;
  if (data.resultDate !== undefined)        result.resultDate       = data.resultDate ? new Date(data.resultDate) : null;
  if (data.doctorName !== undefined)        result.doctorName       = trim(data.doctorName).slice(0, 150);
  if (data.departmentName !== undefined)    result.departmentName   = trim(data.departmentName).slice(0, 150);
  if (data.testName !== undefined)          result.testName         = trim(data.testName).slice(0, 150);
  if (data.testCode !== undefined)          result.testCode         = trim(data.testCode).slice(0, 40);
  if (data.resultItems !== undefined)       result.results          = buildManualResultItems(data.resultItems);
  if (data.generalConclusion !== undefined) result.generalConclusion = trim(data.generalConclusion).slice(0, 2000);
  if (data.internalNote !== undefined)      result.internalNote     = trim(data.internalNote).slice(0, 2000);

  if (wasApproved) {
    // Editing a published result revokes publication — it must be re-approved.
    result.status = 'completed';
    result.approvedBy = null;
    result.approvedAt = null;
    result.isPublicVisible = false;
    result.completedAt = new Date();
  } else if (['draft', 'completed'].includes(data.status)) {
    result.status = data.status;
    if (data.status === 'completed' && !result.completedAt) result.completedAt = new Date();
  }

  await result.save();

  if (result.labOrderId) {
    if (result.status === 'completed') {
      await LabOrder.findOneAndUpdate(
        { _id: result.labOrderId, status: { $in: ['sample_collected', 'processing', 'approved'] } },
        { status: 'completed', completedAt: new Date() },
      );
    }
  }

  try {
    const action = wasApproved ? 'LAB_RESULT_REOPENED_AFTER_EDIT' : 'LAB_RESULT_UPDATE_MANUAL';
    const description = wasApproved
      ? `Approved lab result ${result.protocolNo} was edited — reverted to 'completed' and unpublished, pending re-approval`
      : `Manual lab result ${result.protocolNo} updated`;
    logAction({ userId, action, resourceType: 'LabResult', resourceId: result._id, description });
  } catch (_) {}
  return result.populate(POP_MANUAL);
};

export const listManualResults = async ({ search, status, department, dateFrom, dateTo, page = 1, limit = 20 } = {}) => {
  const filter = { protocolNo: { $ne: null } };
  if (status) filter.status = status;
  if (department) filter.departmentName = new RegExp(escapeRegex(department), 'i');
  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ patientFullName: re }, { patientFin: re }, { protocolNo: re }, { testName: re }];
  }
  if (dateFrom || dateTo) {
    filter.resultDate = {};
    if (dateFrom) filter.resultDate.$gte = new Date(dateFrom);
    if (dateTo)   filter.resultDate.$lte = new Date(dateTo);
  }

  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, parseInt(limit));
  const [results, total] = await Promise.all([
    LabResult.find(filter).populate(POP_MANUAL).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    LabResult.countDocuments(filter),
  ]);
  return { results, total, page: pg, limit: lim };
};

export const getManualResultById = async (id) => {
  requireObjectId(id);
  const result = await LabResult.findOne({ _id: id, protocolNo: { $ne: null } }).populate(POP_MANUAL);
  if (!result) throw new ApiError(404, 'Nəticə tapılmadı');
  return result;
};

// Looks up a predefined parameter template for a test (e.g. allergen panel rows),
// so the result-entry form can pre-fill rows instead of starting from a blank table.
export const getResultParameterTemplate = async ({ testName, testCode } = {}) => {
  const cleanName = normalizeName(testName);
  const cleanCode = normalize(testCode);
  if (!cleanName && !cleanCode) return { template: [] };

  const or = [];
  if (cleanCode) or.push({ serviceCode: cleanCode });
  if (cleanName) or.push({ name: new RegExp(`^${escapeRegex(cleanName)}$`, 'i') });

  const priceList = await PriceList.findOne({ $or: or, isActive: true }).select('resultParameterTemplate');
  return { template: priceList?.resultParameterTemplate || [] };
};

export const approveManualResult = async (id, userId, isPublicVisible) => {
  requireObjectId(id);
  const result = await LabResult.findById(id);
  if (!result) throw new ApiError(404, 'Nəticə tapılmadı');
  if (result.status !== 'completed') throw new ApiError(400, "Yalnız 'Tamamlandı' statuslu nəticə təsdiqlənə bilər");

  if (!trim(result.patientFullName)) throw new ApiError(400, 'Pasiyentin ad və soyadı tələb olunur');
  if (!trim(result.testName)) throw new ApiError(400, 'Test adı tələb olunur');
  if (!result.resultDate) throw new ApiError(400, 'Nəticə tarixi tələb olunur');
  if (!Array.isArray(result.results) || result.results.length === 0) {
    throw new ApiError(400, 'Ən azı bir parametr daxil edilməlidir');
  }
  const incompleteItem = result.results.find((item) => !trim(item.testName) || !trim(item.value));
  if (incompleteItem) throw new ApiError(400, 'Bütün parametrlərdə ad və nəticə dəyəri doldurulmalıdır');

  result.status = 'approved';
  result.approvedBy = userId;
  result.approvedAt = new Date();
  result.isPublicVisible = !!isPublicVisible;
  await result.save();

  if (result.labOrderId) {
    await LabOrder.findOneAndUpdate({ _id: result.labOrderId, status: 'completed' }, { status: 'approved' });
  }

  try {
    logAction({ userId, action: 'LAB_RESULT_APPROVE', resourceType: 'LabResult', resourceId: result._id, description: `Manual lab result ${result.protocolNo} approved` });
  } catch (_) {}
  return result.populate(POP_MANUAL);
};

export const cancelManualResult = async (id, userId) => {
  requireObjectId(id);
  const result = await LabResult.findById(id);
  if (!result) throw new ApiError(404, 'Nəticə tapılmadı');
  if (result.status === 'cancelled') return result;

  result.status = 'cancelled';
  result.isPublicVisible = false;
  await result.save();

  if (result.labOrderId) {
    await LabOrder.findOneAndUpdate(
      { _id: result.labOrderId, status: { $nin: ['approved', 'cancelled'] } },
      { status: 'cancelled' },
    );
  }

  try {
    logAction({ userId, action: 'LAB_RESULT_CANCEL', resourceType: 'LabResult', resourceId: result._id, description: `Manual lab result ${result.protocolNo} cancelled` });
  } catch (_) {}
  return result.populate(POP_MANUAL);
};

// ── Public verify (FIN/birthDate + protocolNo) ──────────────────
export const verifyPublicLabResult = async ({ method, fin, birthDate, protocolNo } = {}) => {
  const cleanMethod = trim(method);
  const cleanProtocol = normalize(protocolNo);
  const cleanFin = normalize(fin);
  const cleanBirthDate = trim(birthDate);

  if (!['fin', 'birthDate'].includes(cleanMethod)) throw new ApiError(400, 'Axtarış metodu düzgün deyil');
  if (!cleanProtocol) throw new ApiError(400, 'Protokol nömrəsi tələb olunur');

  if (cleanMethod === 'fin') {
    if (!cleanFin || !NEW_FIN_REGEX.test(cleanFin)) throw new ApiError(400, 'FİN kod 5-8 simvol arası hərf və rəqəmdən ibarət olmalıdır');
  } else {
    if (!cleanBirthDate) throw new ApiError(400, 'Doğum tarixi tələb olunur');
    const parsed = new Date(`${cleanBirthDate}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) throw new ApiError(400, 'Doğum tarixi düzgün formatda deyil');
    if (parsed.getTime() > Date.now()) throw new ApiError(400, 'Doğum tarixi gələcəkdə ola bilməz');
  }

  let outcome = 'not_found';
  try {
    const result = await LabResult.findOne({
      protocolNo: cleanProtocol,
      status: 'approved',
      isPublicVisible: true,
    });

    if (!result) throw new ApiError(404, VERIFY_GENERIC_NOT_FOUND);

    const matches = cleanMethod === 'fin'
      ? normalize(result.patientFin) === cleanFin
      : sameCalendarDate(result.patientBirthDate, cleanBirthDate);

    if (!matches) throw new ApiError(404, VERIFY_GENERIC_NOT_FOUND);

    outcome = 'success';

    const accessToken = jwt.sign(
      { sub: result._id.toString(), purpose: PDF_TOKEN_PURPOSE },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      { expiresIn: PDF_TOKEN_TTL },
    );

    return {
      id: result._id,
      protocolNo: result.protocolNo,
      patientFullName: result.patientFullName,
      patientFinMasked: maskFinForApi(result.patientFin),
      testName: result.testName,
      testCode: result.testCode,
      resultDate: result.resultDate,
      status: result.status,
      generalConclusion: result.generalConclusion,
      results: (result.results || []).map((item) => ({
        parameterName: item.testName,
        value: item.value,
        unit: item.unit,
        referenceRange: item.referenceRange,
        status: item.status,
      })),
      accessToken,
      accessTokenExpiresIn: PDF_TOKEN_TTL,
    };
  } finally {
    // Safe audit trail — never logs FIN/birthDate, only the protocol + outcome.
    logger.info(`Lab result verify attempt — method=${cleanMethod} protocol=${cleanProtocol} outcome=${outcome}`);
  }
};

// ── Public test-specific result status check (e.g. service test cards) ──
// Unlike verifyPublicLabResult (generic FIN/birthDate lookup used by the
// e-netice page), this is scoped to one specific test (via PriceList slug)
// and reveals whether a matching result exists but isn't approved yet, so
// the UI can show "in progress" / "pending approval" instead of a flat
// not-found. It never returns full result data unless status is approved
// AND isPublicVisible — same security bar as verifyPublicLabResult.
export const checkTestResultStatus = async ({ fin, protocolNo, testSlug } = {}) => {
  const cleanProtocol = normalize(protocolNo);
  const cleanFin = normalize(fin);
  const cleanTestSlug = trim(testSlug).toLowerCase();

  if (!cleanTestSlug) throw new ApiError(400, 'Test identifikatoru tələb olunur');
  if (!cleanFin || !NEW_FIN_REGEX.test(cleanFin)) throw new ApiError(400, 'FİN kod 5-8 simvol arası hərf və rəqəmdən ibarət olmalıdır');
  if (!cleanProtocol) throw new ApiError(400, 'Protokol nömrəsi tələb olunur');

  const expectedTest = await PriceList.findOne({ slug: cleanTestSlug, isActive: true }).select('name serviceCode');
  if (!expectedTest) throw new ApiError(404, 'Test tapılmadı');

  let outcome = 'not_found';
  try {
    const result = await LabResult.findOne({ protocolNo: cleanProtocol });

    const finMatches = result && normalize(result.patientFin) === cleanFin;
    const testMatches = result && (
      (expectedTest.serviceCode && normalize(result.testCode) === normalize(expectedTest.serviceCode)) ||
      normalizeName(result.testName) === normalizeName(expectedTest.name)
    );

    if (!result || !finMatches || !testMatches || result.status === 'cancelled') {
      return { state: 'not_found' };
    }

    if (result.status === 'draft') {
      outcome = 'in_progress';
      return { state: 'in_progress' };
    }

    if (result.status === 'completed' || (result.status === 'approved' && !result.isPublicVisible)) {
      outcome = 'pending_approval';
      return { state: 'pending_approval' };
    }

    outcome = 'success';
    const accessToken = jwt.sign(
      { sub: result._id.toString(), purpose: PDF_TOKEN_PURPOSE },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      { expiresIn: PDF_TOKEN_TTL },
    );

    return {
      state: 'ready',
      id: result._id,
      protocolNo: result.protocolNo,
      patientFullName: result.patientFullName,
      patientFinMasked: maskFinForApi(result.patientFin),
      testName: result.testName,
      testCode: result.testCode,
      sampleDate: result.sampleDate,
      resultDate: result.resultDate,
      status: result.status,
      generalConclusion: result.generalConclusion,
      results: (result.results || []).map((item) => ({
        parameterName: item.testName,
        value: item.value,
        unit: item.unit,
        referenceRange: item.referenceRange,
        status: item.status,
      })),
      accessToken,
      accessTokenExpiresIn: PDF_TOKEN_TTL,
    };
  } finally {
    logger.info(`Lab result status check — test=${cleanTestSlug} protocol=${cleanProtocol} outcome=${outcome}`);
  }
};

// ── Public lab test self-request (book a sample-collection visit) ──────────
const LAB_REQUEST_DEFAULT_HOURS = {
  1: { start: '09:00', end: '17:30' },
  2: { start: '09:00', end: '17:30' },
  3: { start: '09:00', end: '17:30' },
  4: { start: '09:00', end: '17:30' },
  5: { start: '09:00', end: '17:30' },
  6: { start: '09:00', end: '13:30' },
  0: null,
};
const LAB_REQUEST_SLOT_DURATION = 30;

const timeToMins = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
const minsToTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export const getLabRequestSlots = async ({ date, branchName } = {}) => {
  const cleanDate = trim(date);
  const cleanBranch = trim(branchName);
  if (!cleanDate) throw new ApiError(400, 'Tarix tələb olunur');
  if (!cleanBranch) throw new ApiError(400, 'Filial tələb olunur');

  const d = new Date(`${cleanDate}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new ApiError(400, 'Tarix formatı səhvdir. YYYY-MM-DD istifadə edin.');

  const dayOfWeek = d.getUTCDay();
  const hours = LAB_REQUEST_DEFAULT_HOURS[dayOfWeek];
  if (!hours) return { date: cleanDate, branchName: cleanBranch, available: false, slots: [], reason: 'Bazar günü qəbul yoxdur' };

  const dayStart = new Date(`${cleanDate}T00:00:00.000Z`);
  const dayEnd   = new Date(`${cleanDate}T23:59:59.999Z`);

  const booked = await LabOrder.find({
    source: 'public_self_request',
    branchName: cleanBranch,
    preferredDate: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: 'cancelled' },
  }).select('preferredTime');
  const bookedSet = new Set(booked.map((o) => o.preferredTime));

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = cleanDate === todayStr;
  const nowMins = isToday ? (new Date().getHours() * 60 + new Date().getMinutes() + 30) : 0;

  const slots = [];
  let cur = timeToMins(hours.start);
  const end = timeToMins(hours.end);
  while (cur + LAB_REQUEST_SLOT_DURATION <= end) {
    const time = minsToTime(cur);
    const pastTime = isToday && cur < nowMins;
    slots.push({ time, available: !bookedSet.has(time) && !pastTime });
    cur += LAB_REQUEST_SLOT_DURATION;
  }

  return { date: cleanDate, branchName: cleanBranch, available: true, slots };
};

const assertLabRequestSlotIsBookable = async (date, time, branchName) => {
  const { available, slots, reason } = await getLabRequestSlots({ date, branchName });
  if (!available) throw new ApiError(400, reason || 'Seçilmiş tarix üçün qəbul yoxdur');
  const slot = slots.find((s) => s.time === trim(time));
  if (!slot || !slot.available) throw new ApiError(409, 'Seçilmiş saat artıq tutulub və ya keçmişdədir. Zəhmət olmasa başqa saat seçin.');
};

export const getCurrentPatientForRequest = async (userId) => {
  if (!userId) throw new ApiError(401, 'Mövcud pasiyent kimi davam etmək üçün giriş tələb olunur');

  const patient = await Patient.findOne({ userId }).populate('userId', 'fullName name surname');
  const user = patient?.userId;
  if (!patient || !user) throw new ApiError(404, 'Hesabınıza bağlı pasiyent profili tapılmadı');

  return {
    cardNumber: patient.patientId || '',
    maskedName: maskName(user),
  };
};

export const createPublicLabRequest = async (body = {}, authUser = null) => {
  const {
    testSlug, patientType = 'existing', patient: patientBody = {},
    branchName, date, time, note, agreedToTerms,
  } = body;

  if (!agreedToTerms) throw new ApiError(400, 'Testin şərtləri ilə razılaşmalısınız');
  if (!trim(testSlug)) throw new ApiError(400, 'Test seçilməlidir');
  if (!trim(branchName)) throw new ApiError(400, 'Filial seçilməlidir');
  if (!date) throw new ApiError(400, 'Tarix seçilməlidir');
  if (!time) throw new ApiError(400, 'Saat seçilməlidir');

  const priceList = await PriceList.findOne({ slug: trim(testSlug).toLowerCase(), isActive: true });
  if (!priceList) throw new ApiError(404, 'Test tapılmadı');

  await assertLabRequestSlotIsBookable(date, time, branchName);

  let patientMongoId;

  if (patientType === 'new') {
    const { firstName, lastName, fin, birthDate, phone, email } = patientBody;
    if (!firstName?.trim()) throw new ApiError(400, 'Ad daxil edilməlidir');
    if (!lastName?.trim())  throw new ApiError(400, 'Soyad daxil edilməlidir');
    if (!fin?.trim())       throw new ApiError(400, 'FİN daxil edilməlidir');
    if (!birthDate)         throw new ApiError(400, 'Doğum tarixi daxil edilməlidir');
    if (!phone?.trim())     throw new ApiError(400, 'Telefon daxil edilməlidir');

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const cleanPhone = phone.trim();

    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      const guestEmail = email?.trim()?.toLowerCase()
        || `walkin.${cleanPhone.replace(/\D/g, '')}.${Date.now()}@aslanmedical.az`;

      user = await User.create({
        fullName,
        email: guestEmail,
        phone: cleanPhone,
        role: 'PATIENT',
        password: crypto.randomBytes(24).toString('hex'),
        sexiyyatId: fin.trim().toUpperCase().slice(0, 8),
        birthDate: new Date(birthDate),
        isActive: true,
      });
    }

    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) patient = await Patient.create({ userId: user._id });
    patientMongoId = patient._id;
  } else {
    if (!authUser?.id) throw new ApiError(401, 'Mövcud pasiyent kimi davam etmək üçün giriş tələb olunur');

    const patient = await Patient.findOne({ userId: authUser.id }).select('_id');
    if (!patient) throw new ApiError(404, 'Hesabınıza bağlı pasiyent profili tapılmadı');
    patientMongoId = patient._id;
  }

  const order = await LabOrder.create({
    patientId: patientMongoId,
    source: 'public_self_request',
    priceListId: priceList._id,
    tests: [{ testName: priceList.name, testCode: priceList.serviceCode || '', category: 'other' }],
    branchName: trim(branchName),
    preferredDate: new Date(`${date}T00:00:00.000Z`),
    preferredTime: trim(time),
    patientNote: trim(note).slice(0, 1000),
    status: 'pending',
  });

  try {
    logAction({ userId: patientType === 'new' ? null : authUser?.id, action: 'LAB_REQUEST_CREATE_PUBLIC', resourceType: 'LabOrder', resourceId: order._id, description: `Public lab request ${order.requestNumber} created for ${priceList.name}` });
  } catch (_) {}

  return {
    requestNumber: order.requestNumber,
    testName: priceList.name,
    branchName: order.branchName,
    date,
    time: order.preferredTime,
    price: priceList.price,
    currency: priceList.currency || 'AZN',
    preparation: priceList.technicalDetails?.preparation || '',
  };
};

export const getResultPdfBuffer = async (id, { accessToken, authUser } = {}) => {
  requireObjectId(id);
  const result = await LabResult.findById(id).populate(POP_MANUAL);
  if (!result) throw new ApiError(404, 'Nəticə tapılmadı');

  const isStaff = authUser && STAFF_ROLES.includes(authUser.role);

  if (!isStaff) {
    if (!accessToken) throw new ApiError(401, 'Giriş tokeni tələb olunur');
    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, err.name === 'TokenExpiredError' ? 'Token vaxtı bitib' : 'Etibarsız token');
    }
    if (payload.purpose !== PDF_TOKEN_PURPOSE || payload.sub !== String(id)) {
      throw new ApiError(403, 'Bu nəticə üçün giriş icazəsi yoxdur');
    }
    if (result.status !== 'approved' || !result.isPublicVisible) {
      throw new ApiError(404, 'Nəticə tapılmadı');
    }
  }

  const buffer = await createLabResultPDF({
    patientFullName: result.patientFullName,
    patientFin: result.patientFin,
    patientBirthDate: result.patientBirthDate,
    protocolNo: result.protocolNo,
    testName: result.testName,
    testCode: result.testCode,
    departmentName: result.departmentName,
    sampleDate: result.sampleDate,
    resultDate: result.resultDate,
    doctorName: result.doctorName,
    results: result.results,
    generalConclusion: result.generalConclusion,
    labTechnicianName: displayUserName(result.labTechnicianId),
    approvedByName: displayUserName(result.approvedBy),
    approvedAt: result.approvedAt,
  });

  try {
    logAction({ userId: authUser?.id, action: 'LAB_RESULT_PDF_DOWNLOAD', resourceType: 'LabResult', resourceId: result._id, description: `PDF generated for ${result.protocolNo}` });
  } catch (_) {}

  return buffer;
};

export const uploadResultAttachment = async (id, file, userId) => {
  if (!file) throw new ApiError(400, 'No file uploaded');
  const result = await LabResult.findById(id);
  if (!result) throw new ApiError(404, 'Result not found');

  const url = await uploadBuffer(file.buffer, { folder: 'hms/lab-results', resource_type: 'auto' });

  result.attachmentUrl = url;
  await result.save();

  const order = await LabOrder.findById(result.labOrderId);
  if (order) {
    order.resultPdf = url;
    if (!order.completedAt) order.completedAt = new Date();
    await order.save();
  }

  try { logAction({ userId, action: 'UPLOAD_LAB_RESULT_ATTACHMENT', resourceType: 'LabResult', resourceId: result._id, description: `Attachment uploaded for order ${result.labOrderId}` }); } catch (_) {}
  return result.populate([POP_PERF]);
};
