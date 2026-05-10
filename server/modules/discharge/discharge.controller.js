import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Doctor from '../../models/Doctor.model.js';
import * as dischargeService from './discharge.service.js';

const resolveDoctorId = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).select('_id');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found for this user');
  return doctor._id;
};

export const createDischargeSummary = asyncHandler(async (req, res) => {
  const doctorId = await resolveDoctorId(req.user._id);
  const summary = await dischargeService.createDischargeSummary(req.body, doctorId);
  res.status(201).json(new ApiResponse(201, summary, 'Discharge summary created'));
});

export const getDischargeSummaryById = asyncHandler(async (req, res) => {
  const summary = await dischargeService.getDischargeSummaryById(req.params.id);
  res.status(200).json(new ApiResponse(200, summary));
});

// Redirect to the Cloudinary-hosted PDF URL
export const downloadPDF = asyncHandler(async (req, res) => {
  const summary = await dischargeService.getDischargeSummaryById(req.params.id);
  if (!summary.pdfUrl) {
    return res.status(404).json(new ApiResponse(404, null, 'PDF not available'));
  }
  res.redirect(summary.pdfUrl);
});
