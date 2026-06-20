import { v2 as cloudinary } from 'cloudinary';
import DischargeSummary from '../../models/DischargeSummary.model.js';
import Visit from '../../models/Visit.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import ApiError from '../../utils/ApiError.js';
import { createDischargePDF } from '../../utils/generatePDF.js';

// ─── Cloudinary buffer upload ─────────────────────────────────────────────────

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });

// ─── Population helper ────────────────────────────────────────────────────────

const USER_NAME_FIELDS = 'fullName name surname email phone';
const PATIENT_POPULATE = {
  path: 'patientId',
  select: 'userId patientId bloodGroup',
  populate: { path: 'userId', select: USER_NAME_FIELDS },
};
const DOCTOR_POPULATE = {
  path: 'dischargingDoctor',
  select: 'userId specialization',
  populate: { path: 'userId', select: USER_NAME_FIELDS },
};

const populateSummary = (query) =>
  query
    .populate(PATIENT_POPULATE)
    .populate(DOCTOR_POPULATE)
    .populate({
      path: 'visitId',
      select: 'chiefComplaint diagnosis status patientId doctorId',
      populate: [
        {
          path: 'patientId',
          select: 'userId patientId',
          populate: { path: 'userId', select: USER_NAME_FIELDS },
        },
        {
          path: 'doctorId',
          select: 'userId specialization',
          populate: { path: 'userId', select: USER_NAME_FIELDS },
        },
      ],
    })
    .populate('admissionId', 'admissionDate reason');

const displayName = (value) => {
  if (!value) return '';
  const user = value.userId || value;
  const splitName = [user.name, user.surname].filter(Boolean).join(' ').trim();
  return splitName || String(user.fullName || '').trim();
};

const serializeSummary = (summary) => {
  if (!summary) return summary;
  const item = typeof summary.toObject === 'function'
    ? summary.toObject({ virtuals: true })
    : summary;

  return {
    ...item,
    patientName: displayName(item.patientId) || displayName(item.visitId?.patientId) || null,
    doctorName: displayName(item.dischargingDoctor) || displayName(item.visitId?.doctorId) || null,
  };
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createDischargeSummary = async (data, doctorId) => {
  const { visitId, admissionId, finalDiagnosis, treatmentSummary, dischargeMedications, followUpDate, followUpInstructions } = data;

  // Step 1 — verify visit
  const visit = await Visit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.status === 'closed') throw new ApiError(400, 'Visit is already closed');

  // Step 2 — doctor owns visit
  if (String(visit.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You are not authorized to discharge this visit');
  }

  // Step 3 — no duplicate
  const existing = await DischargeSummary.findOne({ visitId });
  if (existing) throw new ApiError(409, 'Discharge summary already exists for this visit');

  // Step 4 — fetch patient & doctor data for PDF
  const [patient, doctor] = await Promise.all([
    Patient.findById(visit.patientId).populate('userId', USER_NAME_FIELDS),
    Doctor.findById(doctorId).populate('userId', USER_NAME_FIELDS),
  ]);

  // Step 5 — create summary document (pdfUrl null initially)
  const summary = await DischargeSummary.create({
    visitId,
    patientId: visit.patientId,
    admissionId: admissionId || null,
    dischargingDoctor: doctorId,
    dischargeDate: new Date(),
    finalDiagnosis,
    treatmentSummary,
    dischargeMedications: dischargeMedications || [],
    followUpDate: followUpDate || null,
    followUpInstructions: followUpInstructions || '',
    pdfUrl: null,
  });

  // Step 6 — generate PDF & upload to Cloudinary
  try {
    const pdfData = {
      patientName:          displayName(patient) || 'N/A',
      patientId:            patient?.patientId || 'N/A',
      bloodGroup:           patient?.bloodGroup || 'N/A',
      doctorName:           displayName(doctor) || 'N/A',
      doctorSpecialization: doctor?.specialization || 'N/A',
      admissionDate:        null,
      dischargeDate:        summary.dischargeDate,
      finalDiagnosis,
      treatmentSummary,
      dischargeMedications: dischargeMedications || [],
      followUpDate:         followUpDate || null,
      followUpInstructions: followUpInstructions || '',
    };

    const pdfBuffer = await createDischargePDF(pdfData);
    const pdfUrl = await uploadBuffer(pdfBuffer, {
      resource_type: 'raw',
      folder: 'discharge-summaries',
      public_id: `discharge-${summary._id}`,
      format: 'pdf',
    });

    summary.pdfUrl = pdfUrl;
    await summary.save();
  } catch {
    // PDF generation failure should not block the discharge — pdfUrl stays null
  }

  // Step 7 — close the visit
  visit.status     = 'closed';
  visit.dischargeId = summary._id;
  await visit.save();

  // Step 8 — return
  return serializeSummary(await populateSummary(DischargeSummary.findById(summary._id)));
};

// ─── Read ─────────────────────────────────────────────────────────────────────

// Patients only ever see discharge summaries that have cleared clinical approval.
const assertPatientVisible = (summary, viewerRole) => {
  if (viewerRole === 'PATIENT' && summary.approvalStatus !== 'approved') {
    throw new ApiError(404, 'Discharge summary not found');
  }
};

export const getDischargeSummaryById = async (summaryId, viewerRole) => {
  const summary = await populateSummary(DischargeSummary.findById(summaryId));
  if (!summary) throw new ApiError(404, 'Discharge summary not found');
  assertPatientVisible(summary, viewerRole);
  return serializeSummary(summary);
};

export const getDischargeSummaryByVisit = async (visitId, viewerRole) => {
  const summary = await populateSummary(DischargeSummary.findOne({ visitId }));
  if (!summary) throw new ApiError(404, 'Discharge summary not found for this visit');
  assertPatientVisible(summary, viewerRole);
  return serializeSummary(summary);
};

export const getAllDischarges = async ({ page = 1, limit = 20 } = {}) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(50, parseInt(limit));
  const [items, total] = await Promise.all([
    populateSummary(DischargeSummary.find())
      .sort({ dischargeDate: -1 })
      .skip((pg - 1) * lim).limit(lim),
    DischargeSummary.countDocuments(),
  ]);
  return { items: items.map(serializeSummary), total, page: pg, limit: lim };
};

export const getDischargesByPatient = async (patientId) => {
  const items = await populateSummary(DischargeSummary.find({ patientId }))
    .sort({ dischargeDate: -1 });
  return items.map(serializeSummary);
};

export const generatePDFBuffer = async (summaryId) => {
  const summary = await populateSummary(DischargeSummary.findById(summaryId));
  if (!summary) throw new ApiError(404, 'Discharge summary not found');

  if (summary.pdfUrl) return { pdfUrl: summary.pdfUrl };

  const pdfData = {
    patientName:          displayName(summary.patientId) || displayName(summary.visitId?.patientId) || 'N/A',
    patientId:            summary.patientId?.patientId || 'N/A',
    bloodGroup:           summary.patientId?.bloodGroup || 'N/A',
    doctorName:           displayName(summary.dischargingDoctor) || displayName(summary.visitId?.doctorId) || 'N/A',
    doctorSpecialization: summary.dischargingDoctor?.specialization || 'N/A',
    admissionDate:        summary.admissionId?.admissionDate || null,
    dischargeDate:        summary.dischargeDate,
    finalDiagnosis:       summary.finalDiagnosis,
    treatmentSummary:     summary.treatmentSummary,
    dischargeMedications: summary.dischargeMedications || [],
    followUpDate:         summary.followUpDate || null,
    followUpInstructions: summary.followUpInstructions || '',
  };

  const pdfBuffer = await createDischargePDF(pdfData);
  return { pdfUrl: null, pdfBuffer };
};
