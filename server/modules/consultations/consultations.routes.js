import { Router } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import Consultation from '../../models/Consultation.model.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = Router();

// POST /api/v1/consultations — public, save consultation request
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, message, aiResponse } = req.body;
  if (!name || !message) {
    return res.status(400).json({ success: false, message: 'Ad və mesaj tələb olunur.' });
  }
  const doc = await Consultation.create({ name, email, phone, message, aiResponse });
  res.status(201).json(new ApiResponse(201, { id: doc._id }, 'Müraciətiniz qəbul edildi.'));
}));

// GET /api/v1/consultations — authenticated users only
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const list = await Consultation.find().sort({ createdAt: -1 }).limit(100);
  res.json(new ApiResponse(200, list));
}));

export default router;
