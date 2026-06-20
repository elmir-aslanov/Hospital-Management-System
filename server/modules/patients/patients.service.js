import Patient from '../../models/Patient.model.js';
import User    from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import { createNotification } from '../notifications/notifications.service.js';
import Appointment        from '../../models/Appointment.model.js';
import LabOrder            from '../../models/LabOrder.model.js';
import LabResult           from '../../models/LabResult.model.js';
import EHR                 from '../../models/EHR.model.js';
import Prescription        from '../../models/Prescription.model.js';
import Invoice             from '../../models/Invoice.model.js';
import Payment             from '../../models/Payment.model.js';
import MedicalCertificate  from '../../models/MedicalCertificate.model.js';
import DischargeSummary    from '../../models/DischargeSummary.model.js';

const POPULATE_USER = 'fullName email phone';

// ─── Create ──────────────────────────────────────────────────────────────────

export const createPatient = async ({ userId, bloodGroup, allergies, chronicConditions, emergencyContact }) => {
  const existing = await Patient.findOne({ userId });
  if (existing) throw new ApiError(409, 'Patient profile already exists');

  const patient = await Patient.create({ userId, bloodGroup, allergies, chronicConditions, emergencyContact });
  return patient.populate('userId', POPULATE_USER);
};

export const adminCreatePatient = async ({ fullName, email, phone, bloodGroup }) => {
  if (!fullName?.trim()) throw new ApiError(400, 'Ad Soyad tələb olunur');
  if (!email?.trim())    throw new ApiError(400, 'E-poçt tələb olunur');

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new ApiError(409, 'Bu e-poçt ünvanı artıq qeydiyyatdadır');

  const autoPassword = 'Patient' + Math.floor(1000 + Math.random() * 9000) + '!';
  const user = await User.create({
    fullName: fullName.trim(),
    email:    email.toLowerCase().trim(),
    phone:    phone?.trim() || '',
    password: autoPassword,
    role:     'PATIENT',
  });

  const patient = await Patient.create({ userId: user._id, bloodGroup: bloodGroup || undefined });
  await patient.populate('userId', POPULATE_USER);

  try {
    await createNotification({
      userId:  user._id,
      title:   'Xoş gəldiniz, ' + fullName.trim() + '!',
      message: `Aslan Medical sisteminə qeydiyyatınız tamamlandı. Pasiyent ID: ${patient.patientId || ''}`,
      type:    'general',
      link:    '/patient',
    });
  } catch (_) {}

  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Yeni pasiyent qeydiyyatı',
      message: `${fullName.trim()} sistemə yeni pasiyent kimi əlavə edildi.`,
      type:    'general',
      link:    '/admin/patients',
    })));
  } catch (_) {}

  return patient;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getPatients = async ({ page = 1, limit = 10 } = {}) => {
  const pg = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  const [patients, total] = await Promise.all([
    Patient.find()
      .populate('userId', POPULATE_USER)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Patient.countDocuments(),
  ]);

  return { patients, total, page: pg, limit: lim };
};

export const getPatientById = async (id) => {
  const patient = await Patient.findById(id).populate('userId', POPULATE_USER);
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updatePatient = async (id, updateData) => {
  const allowed = ['bloodGroup', 'allergies', 'chronicConditions', 'emergencyContact'];
  const safe = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) safe[key] = updateData[key];
  }

  const patient = await Patient.findByIdAndUpdate(id, safe, { new: true, runValidators: true })
    .populate('userId', POPULATE_USER);
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

// ─── Medical History ──────────────────────────────────────────────────────────

export const addMedicalHistory = async (id, { condition, diagnosedAt, notes }) => {
  const patient = await Patient.findById(id);
  if (!patient) throw new ApiError(404, 'Patient not found');

  patient.medicalHistory.push({ condition, diagnosedAt, notes });
  await patient.save();
  return patient.populate('userId', POPULATE_USER);
};

export const getMedicalHistory = async (id) => {
  const patient = await Patient.findById(id).select('medicalHistory patientId');
  if (!patient) throw new ApiError(404, 'Patient not found');

  const sorted = [...patient.medicalHistory].sort(
    (a, b) => new Date(b.diagnosedAt || 0) - new Date(a.diagnosedAt || 0)
  );
  return sorted;
};

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchPatients = async ({ query, condition, page = 1, limit = 10 } = {}) => {
  const pg = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pg - 1) * lim;

  // Build aggregation pipeline so we can filter on populated User.fullName
  const pipeline = [];

  // Join with users collection
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userId',
    },
  });
  pipeline.push({ $unwind: '$userId' });

  // Apply filters
  const matchStage = {};

  if (query) {
    const regex = new RegExp(query, 'i');
    matchStage.$or = [
      { 'userId.fullName': regex },
      { patientId: regex },
    ];
  }

  if (condition) {
    matchStage['medicalHistory.condition'] = { $regex: condition, $options: 'i' };
  }

  if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

  // Count before slicing
  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [
    ...pipeline,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: lim },
    // Clean up user fields returned
    {
      $project: {
        patientId: 1, bloodGroup: 1, allergies: 1, chronicConditions: 1,
        emergencyContact: 1, medicalHistory: 1, createdAt: 1, updatedAt: 1,
        'userId._id': 1, 'userId.fullName': 1, 'userId.email': 1, 'userId.phone': 1,
      },
    },
  ];

  const [countResult, patients] = await Promise.all([
    Patient.aggregate(countPipeline),
    Patient.aggregate(dataPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;
  return { patients, total, page: pg, limit: lim };
};

export const searchPublic = async ({ patientId, birthDate }) => {
  if (!patientId?.trim()) throw new ApiError(400, 'Pasiyent ID tələb olunur');
  if (!birthDate)         throw new ApiError(400, 'Doğum tarixi tələb olunur');

  const patient = await Patient.findOne({ patientId: patientId.trim().toUpperCase() })
    .populate('userId', 'fullName name surname email birthDate');
  if (!patient) throw new ApiError(404, 'Bu ID ilə pasiyent tapılmadı');

  const userBirth = patient.userId?.birthDate;
  if (!userBirth) throw new ApiError(404, 'Pasiyent məlumatları tam deyil');

  const inputDate  = new Date(birthDate).toDateString();
  const storedDate = new Date(userBirth).toDateString();
  if (inputDate !== storedDate) throw new ApiError(401, 'Doğum tarixi uyğun gəlmir');

  return {
    patientId:      patient.patientId,
    fullName:       patient.userId?.fullName || '',
    bloodGroup:     patient.bloodGroup || null,
    allergies:      patient.allergies  || [],
    medicalHistory: patient.medicalHistory?.slice(-3) || [],
  };
};

// ─── Clinical timeline (read-only composition over existing modules) ─────────

// RECEPTIONIST has no clinical/lab access anywhere else in the app — keep the
// timeline consistent with that boundary instead of opening a new one.
const RECEPTIONIST_ALLOWED_SOURCES = new Set(['appointment', 'billing']);
const PER_SOURCE_LIMIT = 300; // bounds each sub-query; final page size is applied after merge

const doctorName = (doc) => doc?.userId?.fullName || doc?.fullName || null;
const doctorDept = (doc) => doc?.departmentId?.name || doc?.department || null;

const DOCTOR_POPULATE = { path: 'doctorId', select: 'userId department departmentId', populate: [
  { path: 'userId', select: 'fullName' },
  { path: 'departmentId', select: 'name' },
] };

export const getPatientTimeline = async (patientId, {
  type, source, dateFrom, dateTo, page = 1, limit = 20, viewerRole,
} = {}) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');

  const createdAtFilter = {};
  if (dateFrom) createdAtFilter.$gte = new Date(dateFrom);
  if (dateTo)   createdAtFilter.$lte = new Date(dateTo);
  const dateClause = Object.keys(createdAtFilter).length ? { createdAt: createdAtFilter } : {};

  const allowedSources = viewerRole === 'RECEPTIONIST' ? RECEPTIONIST_ALLOWED_SOURCES : null;
  const sourceAllowed = (key) => (!allowedSources || allowedSources.has(key)) && (!source || source === key);

  const items = [];

  // ── Appointments — up to 4 derived events per document ──────────────────────
  if (sourceAllowed('appointment')) {
    const appointments = await Appointment.find({ patientId, ...dateClause })
      .populate(DOCTOR_POPULATE)
      .sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean();

    for (const a of appointments) {
      const doctor = a.doctorId;
      const base = { doctorName: doctorName(doctor), department: doctorDept(doctor) };
      items.push({
        id: `appt-${a._id}-created`, source: 'appointment', type: 'appointment_created',
        date: a.createdAt, title: 'Appointment created', status: a.status, ...base,
      });
      if (a.checkedInAt) items.push({
        id: `appt-${a._id}-checkin`, source: 'appointment', type: 'appointment_checked_in',
        date: a.checkedInAt, title: 'Appointment checked in', status: 'waiting', ...base,
      });
      if (a.consultationStartedAt) items.push({
        id: `appt-${a._id}-start`, source: 'appointment', type: 'consultation_started',
        date: a.consultationStartedAt, title: 'Consultation started', status: 'in_progress', ...base,
      });
      if (a.completedAt) items.push({
        id: `appt-${a._id}-complete`, source: 'appointment', type: 'consultation_completed',
        date: a.completedAt, title: 'Consultation completed', status: 'completed', ...base,
      });
    }
  }

  // ── Lab orders + results ─────────────────────────────────────────────────────
  if (sourceAllowed('lab')) {
    const orders = await LabOrder.find({ patientId, ...dateClause })
      .populate(DOCTOR_POPULATE)
      .sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean();

    for (const o of orders) {
      const doctor = o.doctorId;
      const base = { doctorName: doctorName(doctor), department: doctorDept(doctor) };
      const testNames = (o.tests || []).map((t) => t.testName).filter(Boolean).join(', ');
      items.push({
        id: `lab-order-${o._id}-created`, source: 'lab', type: 'lab_request_created',
        date: o.createdAt, title: testNames || 'Lab request created', status: o.status, ...base,
      });
      if (o.sampleCollectedAt) items.push({
        id: `lab-order-${o._id}-sample`, source: 'lab', type: 'lab_sample_collected',
        date: o.sampleCollectedAt, title: testNames || 'Sample collected', status: 'sample_collected', ...base,
      });
    }

    // Patients only ever see results that have cleared approval AND been
    // marked public-visible — same bar as the public E-Nəticə lookup.
    const resultFilter = { patientId, ...dateClause };
    if (viewerRole === 'PATIENT') {
      resultFilter.status = 'approved';
      resultFilter.isPublicVisible = true;
    }
    const results = await LabResult.find(resultFilter)
      .sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean();

    for (const r of results) {
      if (r.completedAt && viewerRole !== 'PATIENT') items.push({
        id: `lab-result-${r._id}-completed`, source: 'lab', type: 'lab_result_completed',
        date: r.completedAt, title: r.testName || 'Lab result completed', status: 'completed',
        doctorName: r.doctorName || null, department: r.departmentName || null,
      });
      if (r.approvedAt) items.push({
        id: `lab-result-${r._id}-approved`, source: 'lab', type: 'lab_result_approved',
        date: r.approvedAt, title: r.testName || 'Lab result approved', status: 'approved',
        doctorName: r.doctorName || null, department: r.departmentName || null,
        // Internal note is never patient/receptionist-facing — only this summary may be shown.
        detail: ['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'].includes(viewerRole)
          ? { summary: r.generalConclusion || '' } : undefined,
      });
    }
  }

  // ── EHR (clinical notes) ─────────────────────────────────────────────────────
  if (sourceAllowed('ehr')) {
    const ehrFilter = { patientId, isActive: true, ...dateClause };
    // Patients only ever see notes that have cleared clinical approval.
    if (viewerRole === 'PATIENT') ehrFilter.approvalStatus = 'approved';
    const records = await EHR.find(ehrFilter)
      .populate(DOCTOR_POPULATE)
      .sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean();

    for (const e of records) {
      const doctor = e.doctorId;
      items.push({
        id: `ehr-${e._id}`, source: 'ehr', type: 'ehr_record_created',
        date: e.date || e.createdAt, title: e.title, status: e.approvalStatus,
        doctorName: doctorName(doctor), department: doctorDept(doctor),
        detail: { description: e.description || '' },
      });
    }
  }

  // ── Prescriptions ─────────────────────────────────────────────────────────────
  if (sourceAllowed('prescription')) {
    const prescriptions = await Prescription.find({ patientId, ...dateClause })
      .populate({ path: 'prescribedBy', select: 'userId specialization', populate: { path: 'userId', select: 'fullName' } })
      .sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean();

    for (const p of prescriptions) {
      const doctor = p.prescribedBy;
      const base = { doctorName: doctorName(doctor), department: null };
      const names = (p.medications || []).map((m) => m.name).filter(Boolean).join(', ');
      const medicationSummary = (p.medications || []).map((m) => [
        m.name,
        m.dosage,
        m.frequency,
        m.duration,
        m.instructions,
      ].filter(Boolean).join(' · ')).join('\n');
      const effectiveStatus = p.isCancelled ? 'cancelled' : (p.status || 'active');
      items.push({
        id: `rx-${p._id}-created`, source: 'prescription', type: 'prescription_created',
        date: p.createdAt, title: names || 'Prescription created', status: effectiveStatus, ...base,
        detail: { summary: [medicationSummary, p.notes].filter(Boolean).join('\n\n') },
      });
      if (p.cancelledAt) items.push({
        id: `rx-${p._id}-cancelled`, source: 'prescription', type: 'prescription_cancelled',
        date: p.cancelledAt, title: names || 'Prescription cancelled', status: 'cancelled', ...base,
        detail: p.cancelReason ? { summary: p.cancelReason } : undefined,
      });
      if (p.archivedAt) items.push({
        id: `rx-${p._id}-archived`, source: 'prescription', type: 'prescription_archived',
        date: p.archivedAt, title: names || 'Prescription archived', status: 'archived', ...base,
        detail: p.archiveReason ? { summary: p.archiveReason } : undefined,
      });
    }
  }

  // ── Billing — invoices + payments ────────────────────────────────────────────
  if (sourceAllowed('billing')) {
    const invoices = await Invoice.find({ patientId, ...dateClause })
      .sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean();
    for (const inv of invoices) {
      items.push({
        id: `invoice-${inv._id}`, source: 'billing', type: 'invoice_created',
        date: inv.createdAt, title: inv.invoiceNumber || 'Invoice created', status: inv.status,
      });
    }

    const payments = await Payment.find({ patientId, status: 'completed', ...dateClause })
      .sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean();
    for (const pay of payments) {
      items.push({
        id: `payment-${pay._id}`, source: 'billing', type: 'payment_completed',
        date: pay.createdAt, title: `${pay.amount} ${pay.currency || 'AZN'}`, status: 'completed',
      });
    }
  }

  // ── Medical documents (certificates / discharge summaries) ──────────────────
  if (sourceAllowed('document')) {
    const [certificates, discharges] = await Promise.all([
      MedicalCertificate.find({ patientId, approvalStatus: 'approved', ...dateClause })
        .populate(DOCTOR_POPULATE).sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean(),
      DischargeSummary.find({ patientId, approvalStatus: 'approved', ...dateClause })
        .populate({ ...DOCTOR_POPULATE, path: 'dischargingDoctor' }).sort({ createdAt: -1 }).limit(PER_SOURCE_LIMIT).lean(),
    ]);
    for (const c of certificates) {
      items.push({
        id: `doc-cert-${c._id}`, source: 'document', type: 'document_approved',
        date: c.approvedAt || c.createdAt, title: c.certificateNumber || 'Medical certificate approved', status: 'approved',
        doctorName: doctorName(c.doctorId), department: doctorDept(c.doctorId),
      });
    }
    for (const d of discharges) {
      items.push({
        id: `doc-discharge-${d._id}`, source: 'document', type: 'document_approved',
        date: d.approvedAt || d.createdAt, title: 'Discharge summary approved', status: 'approved',
        doctorName: doctorName(d.dischargingDoctor), department: doctorDept(d.dischargingDoctor),
      });
    }
  }

  const filtered = type ? items.filter((i) => i.type === type) : items;
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  const start = (pg - 1) * lim;
  const pageItems = filtered.slice(start, start + lim);

  return { items: pageItems, total: filtered.length, page: pg, limit: lim };
};
