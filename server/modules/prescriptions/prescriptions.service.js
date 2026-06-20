import mongoose from 'mongoose';
import Prescription from '../../models/Prescription.model.js';
import Visit from '../../models/Visit.model.js';
import Doctor from '../../models/Doctor.model.js';
import Appointment from '../../models/Appointment.model.js';
import Patient from '../../models/Patient.model.js';
import ApiError from '../../utils/ApiError.js';
import checkDrugAllergies, { checkDrugInteractions } from '../../utils/drugInteractionCheck.js';
import logAction from '../../utils/auditLogger.js';
import { createNotification } from '../notifications/notifications.service.js';

const populatePrescription = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
    .populate({ path: 'prescribedBy', populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization' })
    .populate('visitId', 'chiefComplaint diagnosis clinicalNotes status appointmentId')
    .populate('appointmentId', 'date startTime endTime status');

const paginate = (page = 1, limit = 10) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

const resolveDoctorFilterId = async (doctorId) => {
  if (!doctorId || !mongoose.isValidObjectId(doctorId)) return null;

  const doctor = await Doctor.findOne({
    $or: [{ _id: doctorId }, { userId: doctorId }],
  }).select('_id');

  return doctor?._id ?? doctorId;
};

const assertDoctorPatientAccess = async (doctorId, patientId) => {
  if (!doctorId) throw new ApiError(403, 'Doctor profile is required');

  const relationships = await Promise.all([
    Visit.exists({ doctorId, patientId }),
    Appointment.exists({ doctorId, patientId }),
  ]);

  if (!relationships.some(Boolean)) {
    throw new ApiError(403, 'You can only access patients assigned to you');
  }
};

const notifyPatient = async (patientId, title, message) => {
  try {
    const patient = await Patient.findById(patientId).select('userId');
    if (!patient?.userId) return;
    await createNotification({
      userId: patient.userId,
      title,
      message,
      type: 'general',
      link: '/patient',
    });
  } catch (_) {
    // Notification delivery must not roll back an already-saved medical record.
  }
};

export const createPrescription = async ({ visitId, patientId, medications, notes }, doctorId, req, createdByUserId) => {
  const visit = await Visit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.status === 'closed') throw new ApiError(400, 'Visit is closed');
  if (String(visit.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only prescribe for your own visits');
  }
  if (String(visit.patientId) !== String(patientId)) {
    throw new ApiError(403, 'The selected visit does not belong to this patient');
  }

  // Drug allergy check
  const allergyCheck = await checkDrugAllergies(patientId, medications);
  if (!allergyCheck.safe) {
    throw new ApiError(400, 'Drug allergy conflict detected', allergyCheck.conflicts);
  }

  // Drug interaction check
  try {
    const drugNames = (medications || []).map(m => m.name || m.drugName || m.medicine);
    if (drugNames.length > 1) {
      const interactions = await checkDrugInteractions(drugNames);
      if (interactions?.hasInteraction) {
        console.warn(`Drug interaction warning for patient ${patientId}:`, interactions.details);
        // Don't block — just log. Doctor is responsible.
      }
    }
  } catch (_) {}

  const prescription = await Prescription.create({
    visitId,
    appointmentId: visit.appointmentId || null,
    patientId,
    medications,
    notes,
    diagnosis: visit.diagnosis || '',
    clinicalNote: visit.clinicalNotes || '',
    prescribedBy: doctorId,
    createdBy: createdByUserId || null,
  });

  await Visit.findByIdAndUpdate(visitId, { $push: { prescriptions: prescription._id } });

  logAction({
    userId: createdByUserId,
    action: 'PRESCRIPTION_CREATE',
    resourceType: 'Prescription',
    resourceId: prescription._id,
    description: `Prescription created for patient ${patientId}`,
    req,
    metadata: { visitId, appointmentId: visit.appointmentId || null, status: 'active' },
  });

  await notifyPatient(patientId, 'Yeni resept', 'Sizin üçün yeni resept yaradıldı.');

  return populatePrescription(Prescription.findById(prescription._id));
};

export const getPrescriptionById = async (prescriptionId, { viewerRole, doctorId } = {}) => {
  const prescription = await populatePrescription(Prescription.findById(prescriptionId));
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  if (viewerRole === 'DOCTOR') {
    await assertDoctorPatientAccess(doctorId, prescription.patientId?._id || prescription.patientId);
  }
  return prescription;
};

export const getPrescriptions = async ({ doctorId, patientId, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};

  if (patientId) filter.patientId = patientId;
  if (doctorId) {
    const prescribedBy = await resolveDoctorFilterId(doctorId);
    filter.prescribedBy = prescribedBy ?? new mongoose.Types.ObjectId();
  }

  const [prescriptions, total] = await Promise.all([
    populatePrescription(Prescription.find(filter)).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Prescription.countDocuments(filter),
  ]);

  return { prescriptions, total, page: pg, limit: lim };
};

export const getPrescriptionsByVisit = async (visitId, { viewerRole, doctorId } = {}) => {
  const visit = await Visit.findById(visitId).select('doctorId');
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (viewerRole === 'DOCTOR' && String(visit.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only access your own visits');
  }
  return populatePrescription(Prescription.find({ visitId })).sort({ createdAt: -1 });
};

export const getPatientPrescriptions = async (
  patientId,
  { page, limit, viewerRole, doctorId } = {}
) => {
  if (viewerRole === 'DOCTOR') {
    await assertDoctorPatientAccess(doctorId, patientId);
  }
  const { pg, lim, skip } = paginate(page, limit);
  const [prescriptions, total] = await Promise.all([
    populatePrescription(Prescription.find({ patientId })).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Prescription.countDocuments({ patientId }),
  ]);
  return { prescriptions, total, page: pg, limit: lim };
};

const TERMINAL_STATUSES = ['cancelled', 'archived', 'superseded'];
const effectiveStatus = (prescription) =>
  prescription.isCancelled ? 'cancelled' : (prescription.status || 'active');

const assertOwnership = (prescription, userRole, doctorId) => {
  if (userRole === 'DOCTOR' && String(prescription.prescribedBy) !== String(doctorId)) {
    throw new ApiError(403, 'You can only manage your own prescriptions');
  }
};

// Prescriptions are append-only medical records — "deleting" one cancels it
// instead of removing the document, so the clinical history stays intact.
// `reason` is mandatory: cancellation must always be explainable in the record.
export const cancelPrescription = async (prescriptionId, { userRole, doctorId, userId, req, reason } = {}) => {
  if (!reason?.trim()) throw new ApiError(400, 'Cancellation reason is required');

  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  assertOwnership(prescription, userRole, doctorId);
  const currentStatus = effectiveStatus(prescription);
  if (currentStatus === 'cancelled') {
    return populatePrescription(Prescription.findById(prescription._id));
  }
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    throw new ApiError(409, `A ${currentStatus} prescription cannot be cancelled`);
  }

  prescription.status       = 'cancelled';
  prescription.isCancelled  = true;
  prescription.cancelledAt  = new Date();
  prescription.cancelledBy  = userId;
  prescription.cancelReason = reason.trim();
  await prescription.save();

  logAction({
    userId,
    action: 'PRESCRIPTION_CANCEL',
    resourceType: 'Prescription',
    resourceId: prescription._id,
    description: `Prescription cancelled for patient ${prescription.patientId}`,
    req,
    metadata: { reason: reason.trim(), previousStatus: currentStatus, status: 'cancelled' },
  });

  await notifyPatient(
    prescription.patientId,
    'Resept ləğv edildi',
    'Reseptlərinizdən biri ləğv edildi və tarixçədə saxlanıldı.'
  );

  return populatePrescription(Prescription.findById(prescription._id));
};

// Archiving is a separate, non-clinical-conflict action (e.g. moving old,
// already-completed prescriptions out of the active list) — distinct status,
// distinct audit action, also append-only and reason-required.
export const archivePrescription = async (prescriptionId, { userRole, doctorId, userId, req, reason } = {}) => {
  if (!reason?.trim()) throw new ApiError(400, 'Archive reason is required');

  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  assertOwnership(prescription, userRole, doctorId);
  const currentStatus = effectiveStatus(prescription);
  if (currentStatus === 'archived') {
    return populatePrescription(Prescription.findById(prescription._id));
  }
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    throw new ApiError(409, `A ${currentStatus} prescription cannot be archived`);
  }

  prescription.status        = 'archived';
  prescription.archivedAt    = new Date();
  prescription.archivedBy    = userId;
  prescription.archiveReason = reason.trim();
  await prescription.save();

  logAction({
    userId,
    action: 'PRESCRIPTION_ARCHIVE',
    resourceType: 'Prescription',
    resourceId: prescription._id,
    description: `Prescription archived for patient ${prescription.patientId}`,
    req,
    metadata: { reason: reason.trim(), previousStatus: currentStatus, status: 'archived' },
  });

  await notifyPatient(
    prescription.patientId,
    'Resept arxivləşdirildi',
    'Reseptlərinizdən biri arxivləşdirildi və tarixçədə saxlanıldı.'
  );

  return populatePrescription(Prescription.findById(prescription._id));
};
