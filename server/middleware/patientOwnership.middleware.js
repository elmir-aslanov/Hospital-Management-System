import mongoose from 'mongoose';
import Patient from '../models/Patient.model.js';
import ApiError from '../utils/ApiError.js';

export const PATIENT_OWNERSHIP_DENIED_MESSAGE = 'Bu məlumatlara giriş icazəniz yoxdur.';

const isPatientUser = (user) => user?.role === 'PATIENT';

const denyPatientAccess = () => {
  throw new ApiError(403, PATIENT_OWNERSHIP_DENIED_MESSAGE);
};

const getPathValue = (source, target) =>
  source.split('.').reduce((value, key) => value?.[key], target);

const getDocumentPathValue = (document, path) => {
  if (typeof document?.get === 'function') {
    return document.get(path);
  }

  return getPathValue(path, document);
};

export const canAccessPatientData = async (user, patientId) => {
  if (!isPatientUser(user)) return true;
  if (!patientId || !mongoose.isValidObjectId(patientId)) return false;

  const ownedPatient = await Patient.exists({ _id: patientId, userId: user.id });
  return Boolean(ownedPatient);
};

export const assertPatientOwnership = async (reqOrUser, patientId) => {
  const user = reqOrUser?.user ?? reqOrUser;
  const canAccess = await canAccessPatientData(user, patientId);

  if (!canAccess) {
    denyPatientAccess();
  }

  return true;
};

export const requirePatientOwnership = (source = 'params.patientId') => async (req, _res, next) => {
  try {
    await assertPatientOwnership(req, getPathValue(source, req));
    next();
  } catch (error) {
    next(error);
  }
};

export const requirePatientOwnershipForModel = (
  Model,
  { idParam = 'id', patientPath = 'patientId' } = {}
) => async (req, _res, next) => {
  if (!isPatientUser(req.user)) {
    return next();
  }

  try {
    const resourceId = req.params[idParam];
    if (!resourceId || !mongoose.isValidObjectId(resourceId)) {
      denyPatientAccess();
    }

    const resource = await Model.findById(resourceId).select(patientPath);
    if (!resource) {
      denyPatientAccess();
    }

    await assertPatientOwnership(req, getDocumentPathValue(resource, patientPath));
    next();
  } catch (error) {
    next(error);
  }
};
