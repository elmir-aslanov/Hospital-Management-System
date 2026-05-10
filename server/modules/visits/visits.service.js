import Visit from '../../models/Visit.model.js';
import ApiError from '../../utils/ApiError.js';
import { VISIT_STATUS } from '../../config/constants.js';

export const createVisit = async (data, doctorId) => {
  return Visit.create({ ...data, doctorId, status: VISIT_STATUS.OPEN });
};

export const getVisitById = async (id) => {
  const visit = await Visit.findById(id)
    .populate('patientId')
    .populate('doctorId')
    .populate('prescriptions');
  if (!visit) throw new ApiError(404, 'Visit not found');
  return visit;
};

export const closeVisit = async (id, updates) => {
  const visit = await Visit.findById(id);
  if (!visit) throw new ApiError(404, 'Visit not found');
  if (visit.status === VISIT_STATUS.CLOSED) {
    throw new ApiError(409, 'Visit is already closed');
  }

  Object.assign(visit, updates, { status: VISIT_STATUS.CLOSED });
  await visit.save();
  return visit;
};

export const getPatientVisits = async (patientId) => {
  return Visit.find({ patientId })
    .populate('doctorId', 'specialization')
    .sort({ createdAt: -1 });
};
