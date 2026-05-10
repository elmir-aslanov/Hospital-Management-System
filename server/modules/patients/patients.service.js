import mongoose from 'mongoose';
import Patient from '../../models/Patient.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import { getPagination, paginatedResponse } from '../../utils/pagination.js';

export const createPatient = async (data) => {
  const existing = await Patient.findOne({ userId: data.userId });
  if (existing) throw new ApiError(409, 'Patient profile already exists for this user');
  return Patient.create(data);
};

export const getPatients = async (query) => {
  const { skip, limit, page } = getPagination(query);
  const [data, total] = await Promise.all([
    Patient.find().populate('userId', 'fullName email phone').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Patient.countDocuments(),
  ]);
  return paginatedResponse(data, total, page, limit);
};

export const getPatientById = async (id) => {
  const patient = await Patient.findById(id).populate('userId', 'fullName email phone avatar');
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const updatePatient = async (id, updates) => {
  const patient = await Patient.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

/**
 * Search patients by name (on User.fullName), patientId, or medical condition.
 * Uses aggregation to allow cross-collection name search with correct pagination.
 */
export const searchPatients = async ({ query, condition, page = 1, limit = 10 }) => {
  const { skip, limit: lim, page: pg } = getPagination({ page, limit });

  const matchStage = {};
  if (condition) {
    matchStage['medicalHistory.condition'] = { $regex: condition, $options: 'i' };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
      },
    },
    { $unwind: '$userId' },
  ];

  // Filter by name or patientId after the join
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { 'userId.fullName': { $regex: query, $options: 'i' } },
          { patientId: { $regex: query, $options: 'i' } },
        ],
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [
    ...pipeline,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: lim },
  ];

  const [countResult, data] = await Promise.all([
    Patient.aggregate(countPipeline),
    Patient.aggregate(dataPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;
  return paginatedResponse(data, total, pg, lim);
};
