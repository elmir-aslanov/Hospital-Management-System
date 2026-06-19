import jwt          from 'jsonwebtoken';
import * as svc     from './lab.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';

const uid = (req) => req.user.id || req.user._id;

export const createOrder       = asyncHandler(async (req, res) => { const d = await svc.createOrder(req.body, uid(req));       res.status(201).json(new ApiResponse(201, d, 'Order created')); });
export const getOrders         = asyncHandler(async (req, res) => { const d = await svc.getOrders(req.query);                  res.json(new ApiResponse(200, d)); });
export const getOrderById      = asyncHandler(async (req, res) => { const d = await svc.getOrderById(req.params.id);           res.json(new ApiResponse(200, d)); });
export const updateOrderStatus = asyncHandler(async (req, res) => { const d = await svc.updateOrderStatus(req.params.id, req.body.status, uid(req)); res.json(new ApiResponse(200, d, 'Status updated')); });
export const deleteOrder       = asyncHandler(async (req, res) => { await svc.deleteOrder(req.params.id);                      res.json(new ApiResponse(200, null, 'Order deleted')); });
export const createResult      = asyncHandler(async (req, res) => { const d = await svc.createResult(req.body, uid(req));      res.status(201).json(new ApiResponse(201, d, 'Result saved')); });
export const getResultByOrder  = asyncHandler(async (req, res) => { const d = await svc.getResultByOrder(req.params.orderId);  res.json(new ApiResponse(200, d)); });
export const getPatientResults = asyncHandler(async (req, res) => { const d = await svc.getPatientResults(req.params.patientId); res.json(new ApiResponse(200, d)); });
export const searchPublicResult = asyncHandler(async (req, res) => { const d = await svc.searchPublicResult(req.body);          res.json(new ApiResponse(200, d, 'Analiz nəticəsi tapıldı')); });
export const verifyResult      = asyncHandler(async (req, res) => { const d = await svc.verifyResult(req.params.id, uid(req)); res.json(new ApiResponse(200, d, 'Verified')); });
export const getLabSummary     = asyncHandler(async (req, res) => { const d = await svc.getLabSummary();                       res.json(new ApiResponse(200, d)); });
export const lookupPublicResult = asyncHandler(async (req, res) => { const d = await svc.lookupPublicResult(req.body);         res.json(new ApiResponse(200, d)); });
export const updateResult      = asyncHandler(async (req, res) => { const d = await svc.updateResult(req.params.id, req.body, uid(req)); res.json(new ApiResponse(200, d, 'Result updated')); });
export const uploadResultAttachment = asyncHandler(async (req, res) => { const d = await svc.uploadResultAttachment(req.params.id, req.file, uid(req)); res.json(new ApiResponse(200, d, 'Attachment uploaded')); });

// ── Manual / standalone certified results ───────────────────────
export const createManualResult = asyncHandler(async (req, res) => { const d = await svc.createManualResult(req.body, uid(req)); res.status(201).json(new ApiResponse(201, d, 'Nəticə yaradıldı')); });
export const updateManualResult = asyncHandler(async (req, res) => { const d = await svc.updateManualResult(req.params.id, req.body, uid(req)); res.json(new ApiResponse(200, d, 'Nəticə yeniləndi')); });
export const listManualResults  = asyncHandler(async (req, res) => { const d = await svc.listManualResults(req.query); res.json(new ApiResponse(200, d)); });
export const getManualResult    = asyncHandler(async (req, res) => { const d = await svc.getManualResultById(req.params.id); res.json(new ApiResponse(200, d)); });
export const approveManualResult = asyncHandler(async (req, res) => { const d = await svc.approveManualResult(req.params.id, uid(req), req.body.isPublicVisible); res.json(new ApiResponse(200, d, 'Nəticə təsdiqləndi')); });
export const cancelManualResult  = asyncHandler(async (req, res) => { const d = await svc.cancelManualResult(req.params.id, uid(req)); res.json(new ApiResponse(200, d, 'Nəticə ləğv edildi')); });

// ── Public verify + secure PDF ───────────────────────────────────
export const verifyPublicLabResult = asyncHandler(async (req, res) => {
  const d = await svc.verifyPublicLabResult(req.body);
  res.json(new ApiResponse(200, d, 'Nəticə tapıldı'));
});

export const checkTestResultStatus = asyncHandler(async (req, res) => {
  const d = await svc.checkTestResultStatus(req.body);
  res.json(new ApiResponse(200, d));
});

// ── Public lab test self-request (booking a sample-collection visit) ───────
export const getLabRequestSlots = asyncHandler(async (req, res) => {
  const d = await svc.getLabRequestSlots(req.query);
  res.json(new ApiResponse(200, d));
});

export const lookupExistingPatientForRequest = asyncHandler(async (req, res) => {
  const d = await svc.lookupExistingPatientForRequest(req.body);
  res.json(new ApiResponse(200, d));
});

export const createPublicLabRequest = asyncHandler(async (req, res) => {
  const d = await svc.createPublicLabRequest(req.body);
  res.status(201).json(new ApiResponse(201, d, 'Müraciət qəbul edildi'));
});

export const getResultPdf = asyncHandler(async (req, res) => {
  let authUser = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
      authUser = { id: payload.userId, role: payload.role };
    } catch (_) {
      // Ignore — falls back to accessToken-based public verification below.
    }
  }

  const accessToken = typeof req.query.accessToken === 'string' ? req.query.accessToken : '';
  const buffer = await svc.getResultPdfBuffer(req.params.id, { accessToken, authUser });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="lab-result.pdf"',
    'Content-Length': buffer.length,
  });
  res.send(buffer);
});
