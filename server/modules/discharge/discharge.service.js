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

const populateSummary = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
    .populate({ path: 'dischargingDoctor', populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization' })
    .populate('visitId', 'chiefComplaint diagnosis status')
    .populate('admissionId', 'admissionDate reason');

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
    Patient.findById(visit.patientId).populate('userId', 'fullName'),
    Doctor.findById(doctorId).populate('userId', 'fullName'),
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
      patientName:          patient?.userId?.fullName || 'N/A',
      patientId:            patient?.patientId || 'N/A',
      bloodGroup:           patient?.bloodGroup || 'N/A',
      doctorName:           doctor?.userId?.fullName || 'N/A',
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
  return populateSummary(DischargeSummary.findById(summary._id));
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getDischargeSummaryById = async (summaryId) => {
  const summary = await populateSummary(DischargeSummary.findById(summaryId));
  if (!summary) throw new ApiError(404, 'Discharge summary not found');
  return summary;
};

export const getDischargeSummaryByVisit = async (visitId) => {
  const summary = await populateSummary(DischargeSummary.findOne({ visitId }));
  if (!summary) throw new ApiError(404, 'Discharge summary not found for this visit');
  return summary;
};

export const getAllDischarges = async ({ page = 1, limit = 20 } = {}) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(50, parseInt(limit));
  const [items, total] = await Promise.all([
    DischargeSummary.find()
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
      .populate({ path: 'dischargingDoctor', populate: { path: 'userId', select: 'fullName' } })
      .sort({ dischargeDate: -1 })
      .skip((pg - 1) * lim).limit(lim),
    DischargeSummary.countDocuments(),
  ]);
  return { items, total, page: pg, limit: lim };
};

export const getDischargesByPatient = async (patientId) => {
  return DischargeSummary.find({ patientId })
    .populate({ path: 'dischargingDoctor', populate: { path: 'userId', select: 'fullName' } })
    .sort({ dischargeDate: -1 });
};

export const generatePDFBuffer = async (summaryId) => {
  const summary = await populateSummary(DischargeSummary.findById(summaryId));
  if (!summary) throw new ApiError(404, 'Discharge summary not found');

  if (summary.pdfUrl) return { pdfUrl: summary.pdfUrl };

  const pdfData = {
    patientName:          summary.patientId?.userId?.fullName || 'N/A',
    patientId:            summary.patientId?.patientId || 'N/A',
    bloodGroup:           summary.patientId?.bloodGroup || 'N/A',
    doctorName:           summary.dischargingDoctor?.userId?.fullName || 'N/A',
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
