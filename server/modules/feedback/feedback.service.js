import Feedback from '../../models/Feedback.model.js';
import Patient from '../../models/Patient.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';
import { createNotification } from '../notifications/notifications.service.js';

const paginate = (page = 1, limit = 20) => {
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return { pg, lim, skip: (pg - 1) * lim };
};

// Categories BAS_HEKIM is allowed to see — clinical only, no billing.
const CLINICAL_CATEGORIES = ['service_quality', 'doctor_related', 'lab_related'];

export const createFeedback = async (data, authUser, req) => {
  const subject = data.subject?.trim();
  const message = data.message?.trim();
  if (!subject) throw new ApiError(400, 'Subject is required');
  if (!message) throw new ApiError(400, 'Message is required');

  const payload = {
    subject,
    message,
    category: data.category || 'feedback',
    priority: data.priority || 'medium',
    isAnonymous: !authUser,
  };

  if (authUser) {
    payload.userId = authUser.id;
    const patient = await Patient.findOne({ userId: authUser.id }).select('_id');
    if (patient) payload.patientId = patient._id;
  } else {
    // Anonymous public submission — mirrors the existing public contact form policy.
    payload.contactEmail = data.contactEmail?.trim() || '';
    payload.contactPhone = data.contactPhone?.trim() || '';
  }

  const feedback = await Feedback.create(payload);

  try {
    logAction({
      userId: authUser?.id || null, action: 'FEEDBACK_CREATE', resourceType: 'Feedback', resourceId: feedback._id,
      description: `Feedback submitted: ${feedback.category}`, req, metadata: { priority: feedback.priority },
    });
  } catch (_) {}

  if (feedback.priority === 'high') {
    try {
      const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true }).select('_id');
      await Promise.all(admins.map((a) => createNotification({
        userId: a._id,
        title: 'Yüksək prioritetli müraciət',
        message: subject,
        type: 'feedback',
        link: '/admin/feedback',
      })));
    } catch (_) {}
  }

  return feedback;
};

export const getMyFeedback = async (userId, { page, limit } = {}) => {
  const { pg, lim, skip } = paginate(page, limit);
  const filter = { userId };
  const [items, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
    Feedback.countDocuments(filter),
  ]);
  return { items, total, page: pg, limit: lim };
};

export const getFeedbackList = async (query, authUser) => {
  const { pg, lim, skip } = paginate(query.page, query.limit);
  const filter = {};
  if (query.status)   filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.priority) filter.priority = query.priority;

  // BAS_HEKIM is clinical-oversight only — never sees billing-related items,
  // regardless of any category filter passed in.
  if (authUser.role === 'BAS_HEKIM') {
    filter.category = filter.category && CLINICAL_CATEGORIES.includes(filter.category)
      ? filter.category
      : { $in: CLINICAL_CATEGORIES };
  }

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .populate('userId', 'fullName email role')
      .populate('respondedBy', 'fullName')
      .sort({ createdAt: -1 }).skip(skip).limit(lim),
    Feedback.countDocuments(filter),
  ]);
  return { items, total, page: pg, limit: lim };
};

const assertReadAccess = async (feedback, authUser) => {
  if (['ADMIN', 'SUPER_ADMIN'].includes(authUser.role)) return;
  if (authUser.role === 'BAS_HEKIM') {
    if (!CLINICAL_CATEGORIES.includes(feedback.category)) throw new ApiError(403, 'Not allowed to view this item');
    return;
  }
  if (String(feedback.userId) !== String(authUser.id)) throw new ApiError(403, 'You can only view your own feedback');
};

export const getFeedbackById = async (id, authUser) => {
  const feedback = await Feedback.findById(id).populate('userId', 'fullName email').populate('respondedBy', 'fullName');
  if (!feedback) throw new ApiError(404, 'Feedback not found');
  await assertReadAccess(feedback, authUser);
  return feedback;
};

// Admin/SUPER_ADMIN only — status transitions and response. No hard-delete;
// "closed" is the terminal archival state.
export const updateFeedbackStatus = async (id, { status, adminResponse }, userId, req) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) throw new ApiError(404, 'Feedback not found');

  if (status) feedback.status = status;
  if (adminResponse !== undefined) {
    feedback.adminResponse = adminResponse.trim();
    feedback.respondedBy = userId;
    feedback.respondedAt = new Date();
  }
  await feedback.save();

  if (feedback.userId && adminResponse) {
    try {
      await createNotification({
        userId: feedback.userId,
        title: 'Müraciətinizə cavab verildi',
        message: adminResponse.trim().slice(0, 200),
        type: 'feedback',
        link: '/patient/dashboard',
      });
    } catch (_) {}
  }

  logAction({
    userId, action: 'FEEDBACK_STATUS_UPDATE', resourceType: 'Feedback', resourceId: feedback._id,
    description: `Feedback status updated to ${feedback.status}`, req,
  });

  return feedback;
};
