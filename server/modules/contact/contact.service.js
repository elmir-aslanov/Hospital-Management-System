import ContactMessage from '../../models/ContactMessage.model.js';
import ApiError       from '../../utils/ApiError.js';
import { createNotification } from '../notifications/notifications.service.js';
import User from '../../models/User.model.js';

export const submit = async (data) => {
  const message = await ContactMessage.create(data);

  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'] }, isActive: true }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Yeni müraciət',
      message: `${data.name || 'Naməlum'} tərəfindən yeni müraciət daxil oldu.`,
      type:    'general',
      link:    '/admin/muraciet',
    })));
  } catch (_) {}

  return message;
};

export const getAll = ({ status } = {}) => {
  const filter = status ? { status } : {};
  return ContactMessage.find(filter).sort({ createdAt: -1 }).lean();
};

export const markRead = async (id) => {
  const doc = await ContactMessage.findByIdAndUpdate(
    id, { status: 'read' }, { new: true }
  );
  if (!doc) throw new ApiError(404, 'Message not found');
  return doc;
};

export const markReplied = async (id) => {
  const doc = await ContactMessage.findByIdAndUpdate(
    id, { status: 'replied' }, { new: true }
  );
  if (!doc) throw new ApiError(404, 'Message not found');
  return doc;
};

export const remove = async (id) => {
  const doc = await ContactMessage.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Message not found');
};
