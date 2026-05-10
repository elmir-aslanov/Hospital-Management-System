import Prescription from '../../models/Prescription.model.js';
import Visit from '../../models/Visit.model.js';
import ApiError from '../../utils/ApiError.js';

export const createPrescription = async (data, prescribedBy) => {
  const prescription = await Prescription.create({ ...data, prescribedBy });

  // Link prescription to the visit
  await Visit.findByIdAndUpdate(data.visitId, {
    $push: { prescriptions: prescription._id },
  });

  return prescription;
};

export const getPrescriptionById = async (id) => {
  const prescription = await Prescription.findById(id)
    .populate('prescribedBy', 'specialization')
    .populate('patientId', 'patientId');
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  return prescription;
};

export const getPrescriptionsByVisit = async (visitId) => {
  return Prescription.find({ visitId }).populate('prescribedBy', 'specialization');
};

export const getPrescriptionsByPatient = async (patientId) => {
  return Prescription.find({ patientId })
    .populate('prescribedBy', 'specialization')
    .sort({ createdAt: -1 });
};
