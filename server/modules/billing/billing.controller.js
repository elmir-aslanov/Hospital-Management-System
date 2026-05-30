import * as billingService from './billing.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.createInvoice(req.body, req.user.id || req.user._id);
  res.status(201).json(new ApiResponse(201, invoice, 'Invoice created'));
});

export const getInvoices = asyncHandler(async (req, res) => {
  const result = await billingService.getInvoices(req.query);
  res.json(new ApiResponse(200, result));
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await billingService.getInvoiceById(req.params.id);
  res.json(new ApiResponse(200, invoice));
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await billingService.updateInvoiceStatus(req.params.id, req.body.status);
  res.json(new ApiResponse(200, invoice, 'Status updated'));
});

export const addPayment = asyncHandler(async (req, res) => {
  const payment = await billingService.addPayment(req.body, req.user.id || req.user._id);
  res.status(201).json(new ApiResponse(201, payment, 'Payment recorded'));
});

export const getPatientPayments = asyncHandler(async (req, res) => {
  const payments = await billingService.getPatientPayments(req.params.patientId);
  res.json(new ApiResponse(200, payments));
});

export const getBillingSummary = asyncHandler(async (req, res) => {
  const summary = await billingService.getBillingSummary();
  res.json(new ApiResponse(200, summary));
});
