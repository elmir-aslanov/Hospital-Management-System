import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as referralsService from './referrals.service.js';

export const createReferral = asyncHandler(async (req, res) => {
  const referral = await referralsService.createReferral(req.body, req.user.id, req);
  res.status(201).json(new ApiResponse(201, referral, 'Referral created'));
});

export const getReferrals  = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await referralsService.getReferrals(req.query))); });
export const getReferralById = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await referralsService.getReferralById(req.params.id))); });
export const getPatientReferralHistory = asyncHandler(async (req, res) => { res.status(200).json(new ApiResponse(200, await referralsService.getPatientReferralHistory(req.params.patientId))); });

export const updateReferralStatus = asyncHandler(async (req, res) => {
  const referral = await referralsService.updateReferralStatus(req.params.id, req.body, req.user, req);
  res.status(200).json(new ApiResponse(200, referral, 'Referral updated'));
});
