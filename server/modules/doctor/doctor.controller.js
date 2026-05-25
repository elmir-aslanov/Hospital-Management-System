import asyncHandler  from '../../utils/asyncHandler.js';
import ApiResponse   from '../../utils/ApiResponse.js';
import ApiError      from '../../utils/ApiError.js';
import Appointment   from '../../models/Appointment.model.js';
import MedicalRecord from '../../models/MedicalRecord.model.js';
import Prescription  from '../../models/Prescription.model.js';
import Doctor        from '../../models/Doctor.model.js';

// Helper: resolve Doctor doc from req.user (User _id)
const getDoctorDoc = async (userId) => {
  const doc = await Doctor.findOne({ userId });
  if (!doc) throw new ApiError(404, 'Doctor profile not found');
  return doc;
};

export const getTodayAppointments = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);

  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctorId: doctor._id,
    date: { $gte: start, $lte: end },
  })
    .sort({ startTime: 1 })
    .populate({ path: 'patientId', select: 'userId patientId', populate: { path: 'userId', select: 'fullName phone' } })
    .lean();

  res.json(new ApiResponse(200, appointments));
});

export const getPatientAnalyses = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({ patientId: req.params.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(new ApiResponse(200, records));
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.params.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(new ApiResponse(200, prescriptions));
});

export const createPrescription = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);
  const { patientId, medicine, dose, duration, note } = req.body;

  if (!patientId || !medicine || !dose || !duration) {
    throw new ApiError(400, 'patientId, medicine, dose və duration tələb olunur');
  }

  // visitId is optional from dashboard — use a sentinel or require from body
  const visitId = req.body.visitId;
  if (!visitId) throw new ApiError(400, 'visitId tələb olunur');

  const prescription = await Prescription.create({
    visitId,
    patientId,
    prescribedBy: doctor._id,
    medications: [{ name: medicine, dosage: dose, frequency: '-', duration, instructions: note || '' }],
    notes: note,
  });

  res.status(201).json(new ApiResponse(201, prescription, 'Resept yazıldı'));
});
