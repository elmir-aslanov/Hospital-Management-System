import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:           { type: String, required: true, trim: true },
  isRead:         { type: Boolean, default: false },
  readAt:         { type: Date, default: null },
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const getConversationId = (id1, id2) =>
  [id1.toString(), id2.toString()].sort().join('_');

export default mongoose.model('Message', messageSchema);
