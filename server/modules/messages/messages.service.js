import Message, { getConversationId } from '../../models/Message.model.js';

export const getConversation = async (userId1, userId2, page = 1, limit = 50) => {
  const convId = getConversationId(userId1, userId2);
  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(100, parseInt(limit));
  const messages = await Message.find({ conversationId: convId })
    .populate('senderId', 'fullName photoUrl')
    .sort({ createdAt: 1 })
    .skip((pg - 1) * lim).limit(lim);
  return messages;
};

export const sendMessage = async (senderId, receiverId, text) => {
  const convId = getConversationId(senderId, receiverId);
  const msg = await Message.create({ conversationId: convId, senderId, receiverId, text });
  await msg.populate('senderId', 'fullName photoUrl');
  return msg;
};

export const markRead = async (conversationId, userId) => {
  await Message.updateMany(
    { conversationId, receiverId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

export const getConversations = async (userId) => {
  const msgs = await Message.aggregate([
    { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unread: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);
  return msgs;
};
