import ContactMessage from '../../models/ContactMessage.model.js';
import ApiError       from '../../utils/ApiError.js';

export const submit = (data) => ContactMessage.create(data);

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
