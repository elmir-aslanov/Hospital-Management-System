import jwt from 'jsonwebtoken';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as svc from './feedback.service.js';

const uid = (req) => req.user.id || req.user._id;

// Public submission endpoint accepts an optional Bearer token so a logged-in
// patient is auto-linked, while an anonymous visitor can still submit —
// mirrors the existing public contact-form policy.
const optionalAuthUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
    return { id: payload.userId, role: payload.role };
  } catch (_) {
    return null;
  }
};

export const createFeedback = asyncHandler(async (req, res) => {
  const authUser = optionalAuthUser(req);
  const data = await svc.createFeedback(req.body, authUser, req);
  res.status(201).json(new ApiResponse(201, data, 'Müraciətiniz qeydə alındı'));
});

export const getMyFeedback = asyncHandler(async (req, res) => {
  const data = await svc.getMyFeedback(uid(req), req.query);
  res.json(new ApiResponse(200, data));
});

export const getFeedbackList = asyncHandler(async (req, res) => {
  const data = await svc.getFeedbackList(req.query, req.user);
  res.json(new ApiResponse(200, data));
});

export const getFeedbackById = asyncHandler(async (req, res) => {
  const data = await svc.getFeedbackById(req.params.id, req.user);
  res.json(new ApiResponse(200, data));
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const data = await svc.updateFeedbackStatus(req.params.id, req.body, uid(req), req);
  res.json(new ApiResponse(200, data, 'Status yeniləndi'));
});
