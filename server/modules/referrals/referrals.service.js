import Referral from '../../models/Referral.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import Department from '../../models/Department.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';
import { createNotification } from '../notifications/notifications.service.js';

const REFERRAL_TRANSITIONS = Object.freeze({
  pending:   ['accepted', 'declined', 'cancelled'],
  accepted:  ['completed', 'cancelled'],
  declined:  [],
  completed: [],
  cancelled: [],
});

const populate = (query) =>
  query
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
    .populate({ path: 'referringDoctorId', populate: { path: 'userId', select: 'fullName' } })
    .populate({ path: 'referredToDoctorId', populate: { path: 'userId', select: 'fullName' } })
    .populate('referredToDepartmentId', 'name');

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

export const createReferral = async (data, userId, req) => {
  const { patientId, referringDoctorId, referredToDoctorId, referredToDepartmentId, reason, clinicalNotes, urgency } = data;

  if (!referredToDoctorId && !referredToDepartmentId) {
    throw new ApiError(400, 'Either referredToDoctorId or referredToDepartmentId is required');
  }

  const [patient, referringDoctor, referredToDoctor, referredToDepartment] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(referringDoctorId),
    referredToDoctorId ? Doctor.findById(referredToDoctorId) : null,
    referredToDepartmentId ? Department.findById(referredToDepartmentId) : null,
  ]);
  if (!patient)         throw new ApiError(404, 'Patient not found');
  if (!referringDoctor) throw new ApiError(404, 'Referring doctor not found');
  if (referredToDoctorId && !referredToDoctor) throw new ApiError(404, 'Referred-to doctor not found');
  if (referredToDepartmentId && !referredToDepartment) throw new ApiError(404, 'Referred-to department not found');
  if (referredToDoctorId && String(referredToDoctorId) === String(referringDoctorId)) {
    throw new ApiError(400, 'Cannot refer a patient to the same doctor');
  }

  const referral = await Referral.create({
    patientId, referringDoctorId, referredToDoctorId, referredToDepartmentId,
    reason, clinicalNotes, urgency, createdBy: userId,
  });

  logAction({ userId, action: 'REFERRAL_CREATE', resourceType: 'Referral', resourceId: referral._id, description: `Referral created for patient ${patientId}`, req });

  if (referredToDoctor?.userId) {
    try {
      await createNotification({
        userId: referredToDoctor.userId, title: 'Yeni yönləndirmə', message: `Sizə pasiyent yönləndirildi: ${reason}`,
        type: 'referral', link: '/doctor/referrals',
      });
    } catch (_) { /* best-effort */ }
  }

  return populate(Referral.findById(referral._id));
};

export const getReferrals = async ({ status, patientId, referringDoctorId, referredToDoctorId, departmentId, page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = {};
  if (status)              filter.status = status;
  if (patientId)           filter.patientId = patientId;
  if (referringDoctorId)   filter.referringDoctorId = referringDoctorId;
  if (referredToDoctorId)  filter.referredToDoctorId = referredToDoctorId;
  if (departmentId)        filter.referredToDepartmentId = departmentId;

  const [referrals, total] = await Promise.all([
    populate(Referral.find(filter)).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Referral.countDocuments(filter),
  ]);
  return { referrals, total, page: pg, limit: lim };
};

export const getReferralById = async (id) => {
  const referral = await populate(Referral.findById(id));
  if (!referral) throw new ApiError(404, 'Referral not found');
  return referral;
};

// Only the doctor a referral was actually addressed to (or an admin/chief
// doctor) may accept/decline/complete it — a department-wide referral with
// no specific doctor can be actioned by anyone in that department's role set
// is out of scope here, so those stay admin/chief-doctor managed.
const assertCanAction = async (referral, user) => {
  if (['ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM'].includes(user.role)) return;
  if (user.role !== 'DOCTOR') throw new ApiError(403, 'You are not authorized to update this referral');

  const doctor = await Doctor.findOne({ userId: user.id }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');

  const targetId = referral.referredToDoctorId?._id || referral.referredToDoctorId;
  const referringId = referral.referringDoctorId?._id || referral.referringDoctorId;
  if (targetId && String(targetId) === String(doctor._id)) return;
  if (referringId && String(referringId) === String(doctor._id)) return;
  throw new ApiError(403, 'You are not authorized to update this referral');
};

export const updateReferralStatus = async (id, { status, declineReason, consultationNotes }, user, req) => {
  const referral = await Referral.findById(id).populate('referredToDoctorId').populate('referringDoctorId');
  if (!referral) throw new ApiError(404, 'Referral not found');

  const allowed = REFERRAL_TRANSITIONS[referral.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Cannot move referral from '${referral.status}' to '${status}'`);
  }

  await assertCanAction(referral, user);

  referral.status = status;
  if (status === 'declined')  referral.declineReason = declineReason || '';
  if (status === 'completed') referral.consultationNotes = consultationNotes || '';
  await referral.save();

  logAction({ userId: user.id, action: 'REFERRAL_STATUS_UPDATE', resourceType: 'Referral', resourceId: referral._id, description: `Referral ${id} -> ${status}`, req });

  return populate(Referral.findById(referral._id));
};

export const getPatientReferralHistory = async (patientId) =>
  populate(Referral.find({ patientId })).sort({ createdAt: -1 });
