import ConsentForm from '../../models/ConsentForm.model.js';
import Patient from '../../models/Patient.model.js';
import Appointment from '../../models/Appointment.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';
import { createNotification } from '../notifications/notifications.service.js';

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

const PATIENT_POPULATE = { path: 'patientId', populate: { path: 'userId', select: 'fullName' } };
const DOCTOR_POPULATE  = { path: 'doctorId', populate: { path: 'userId', select: 'fullName' } };

// Mirrors the identical check in ehr.service.js — a doctor may only act on
// patients they have actually treated (have an appointment with).
const assertDoctorPatientAccess = async (doctorId, patientId) => {
  const hasAppointment = await Appointment.exists({ doctorId, patientId });
  if (!hasAppointment) throw new ApiError(403, 'Bu pasiyent sizə aid deyil');
};

export const createConsentForm = async (data, { doctorId, isPrivileged, userId, req }) => {
  if (!data.title?.trim()) throw new ApiError(400, 'Title is required');
  if (!data.content?.trim()) throw new ApiError(400, 'Content is required');
  if (!data.patientId) throw new ApiError(400, 'patientId is required');

  if (!isPrivileged) await assertDoctorPatientAccess(doctorId, data.patientId);

  const form = await ConsentForm.create({
    patientId: data.patientId,
    doctorId: isPrivileged ? data.doctorId : doctorId,
    appointmentId: data.appointmentId || null,
    relatedDocumentId: data.relatedDocumentId || null,
    consentType: data.consentType,
    title: data.title.trim(),
    content: data.content.trim(),
  });

  try {
    logAction({ userId, action: 'CONSENT_FORM_CREATE', resourceType: 'ConsentForm', resourceId: form._id, description: 'Consent form created', req });
  } catch (_) {}

  return form.populate([PATIENT_POPULATE, DOCTOR_POPULATE]);
};

export const updateConsentForm = async (id, data, { doctorId, isPrivileged }) => {
  const form = await ConsentForm.findById(id);
  if (!form) throw new ApiError(404, 'Consent form not found');
  if (!isPrivileged && String(form.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only edit your own consent forms');
  }
  if (form.status !== 'draft') {
    throw new ApiError(400, 'Only a draft consent form can be edited');
  }

  if (data.title !== undefined) form.title = data.title.trim();
  if (data.content !== undefined) form.content = data.content.trim();
  if (data.consentType !== undefined) form.consentType = data.consentType;
  await form.save();
  return form.populate([PATIENT_POPULATE, DOCTOR_POPULATE]);
};

export const sendConsentForm = async (id, { doctorId, isPrivileged, userId, req }) => {
  const form = await ConsentForm.findById(id).populate(PATIENT_POPULATE);
  if (!form) throw new ApiError(404, 'Consent form not found');
  if (!isPrivileged && String(form.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only send your own consent forms');
  }
  if (form.status !== 'draft') throw new ApiError(400, `Cannot send a form with status '${form.status}'`);

  form.status = 'pending_patient';
  form.sentAt = new Date();
  await form.save();

  const patientUserId = form.patientId?.userId?._id || form.patientId?.userId;
  if (patientUserId) {
    try {
      await createNotification({
        userId: patientUserId,
        title: 'Razılıq forması göndərildi',
        message: form.title,
        type: 'consent',
        link: '/patient/dashboard',
      });
    } catch (_) {}
  }

  logAction({ userId, action: 'CONSENT_FORM_SENT', resourceType: 'ConsentForm', resourceId: form._id, description: 'Consent form sent to patient', req });
  return form;
};

// Patient confirms or declines — ownership is enforced by the caller via
// requirePatientOwnershipForModel before this runs.
export const respondToConsentForm = async (id, { action, declinedReason }, patientUserId, req) => {
  const form = await ConsentForm.findById(id).populate(DOCTOR_POPULATE);
  if (!form) throw new ApiError(404, 'Consent form not found');
  if (form.status !== 'pending_patient') {
    throw new ApiError(400, `Cannot respond to a form with status '${form.status}'`);
  }
  if (action === 'decline' && !declinedReason?.trim()) {
    throw new ApiError(400, 'Decline reason is required');
  }

  if (action === 'sign') {
    form.status = 'signed';
    form.signedAt = new Date();
    form.signedBy = patientUserId;
  } else if (action === 'decline') {
    form.status = 'declined';
    form.declinedAt = new Date();
    form.declinedReason = declinedReason.trim();
  } else {
    throw new ApiError(400, 'Invalid action');
  }
  await form.save();

  const doctorUserId = form.doctorId?.userId?._id || form.doctorId?.userId;
  if (doctorUserId) {
    try {
      await createNotification({
        userId: doctorUserId,
        title: action === 'sign' ? 'Razılıq formanız imzalandı' : 'Razılıq formanız rədd edildi',
        message: form.title,
        type: 'consent',
        link: '/doctor/consent-forms',
      });
    } catch (_) {}
  }

  logAction({
    userId: patientUserId, action: action === 'sign' ? 'CONSENT_FORM_SIGNED' : 'CONSENT_FORM_DECLINED',
    resourceType: 'ConsentForm', resourceId: form._id, description: `Consent form ${form.status}`, req,
  });
  return form;
};

// Archival is the only way a non-draft form is ever removed from active
// view — no hard-delete anywhere in this module.
export const archiveConsentForm = async (id, { doctorId, isPrivileged, userId, req }) => {
  const form = await ConsentForm.findById(id);
  if (!form) throw new ApiError(404, 'Consent form not found');
  if (!isPrivileged && String(form.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only archive your own consent forms');
  }
  if (form.status === 'archived') throw new ApiError(400, 'Already archived');

  form.status = 'archived';
  form.archivedAt = new Date();
  form.archivedBy = userId;
  await form.save();

  logAction({ userId, action: 'CONSENT_FORM_ARCHIVED', resourceType: 'ConsentForm', resourceId: form._id, description: 'Consent form archived', req });
  return form;
};

export const getMyConsentForms = async (patientUserId, { page, limit } = {}) => {
  const patient = await Patient.findOne({ userId: patientUserId }).select('_id');
  if (!patient) return { items: [], total: 0, page: 1, limit: 20 };
  const { pg, lim, skip } = paginate(page, limit);
  const filter = { patientId: patient._id };
  const [items, total] = await Promise.all([
    ConsentForm.find(filter).populate(DOCTOR_POPULATE).sort({ createdAt: -1 }).skip(skip).limit(lim),
    ConsentForm.countDocuments(filter),
  ]);
  return { items, total, page: pg, limit: lim };
};

export const getDoctorConsentForms = async (doctorId, { page, limit, status } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = { doctorId };
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    ConsentForm.find(filter).populate(PATIENT_POPULATE).sort({ createdAt: -1 }).skip(skip).limit(lim),
    ConsentForm.countDocuments(filter),
  ]);
  return { items, total, page: pg, limit: lim };
};

export const getConsentFormById = async (id, { doctorId, isPrivileged }) => {
  const form = await ConsentForm.findById(id).populate(PATIENT_POPULATE).populate(DOCTOR_POPULATE);
  if (!form) throw new ApiError(404, 'Consent form not found');
  if (!isPrivileged && doctorId && String(form.doctorId?._id || form.doctorId) !== String(doctorId)) {
    throw new ApiError(403, 'You can only view your own consent forms');
  }
  return form;
};
