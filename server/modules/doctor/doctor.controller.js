import asyncHandler  from '../../utils/asyncHandler.js';
import ApiResponse   from '../../utils/ApiResponse.js';
import ApiError      from '../../utils/ApiError.js';
import Appointment   from '../../models/Appointment.model.js';
import MedicalRecord from '../../models/MedicalRecord.model.js';
import Prescription  from '../../models/Prescription.model.js';
import Doctor        from '../../models/Doctor.model.js';
import Patient       from '../../models/Patient.model.js';
import LabOrder      from '../../models/LabOrder.model.js';

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

// ─── New doctor-specific endpoints ───────────────────────────────────────────

export const getMyProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id })
    .populate('userId', 'fullName name surname email phone photoUrl')
    .populate('departmentId', 'name slug');
  if (!doctor) throw new ApiError(404, 'Doctor profile not found');
  res.json(new ApiResponse(200, doctor));
});

export const getMyPatients = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);

  const patientIds = await Appointment.find({ doctorId: doctor._id }).distinct('patientId');

  const patients = await Patient.find({ _id: { $in: patientIds } })
    .populate('userId', 'fullName name surname email phone')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, { patients, total: patients.length }));
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);

  const { status, date, page = 1, limit = 20 } = req.query;
  const filter = { doctorId: doctor._id };
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const e = new Date(date); e.setHours(23, 59, 59, 999);
    filter.date = { $gte: d, $lte: e };
  }

  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(50, parseInt(limit));

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email phone' } })
      .sort({ date: -1, startTime: 1 })
      .skip((pg - 1) * lim).limit(lim),
    Appointment.countDocuments(filter),
  ]);
  res.json(new ApiResponse(200, { appointments, total, page: pg, limit: lim }));
});

export const getMyStats = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [todayCount, totalCount, completedCount, pendingCount] = await Promise.all([
    Appointment.countDocuments({ doctorId: doctor._id, date: { $gte: today, $lte: todayEnd } }),
    Appointment.countDocuments({ doctorId: doctor._id }),
    Appointment.countDocuments({ doctorId: doctor._id, status: 'completed' }),
    Appointment.countDocuments({ doctorId: doctor._id, status: { $in: ['scheduled', 'waiting'] } }),
  ]);

  res.json(new ApiResponse(200, {
    todayCount, totalCount, completedCount, pendingCount,
    averageRating: doctor.averageRating,
    totalRatings:  doctor.totalRatings,
  }));
});

export const createLabOrder = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);
  const order = await LabOrder.create({ ...req.body, doctorId: doctor._id });
  res.status(201).json(new ApiResponse(201, order, 'Lab order created'));
});

export const getMyLabOrders = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { doctorId: doctor._id };
  if (status) filter.status = status;

  const pg  = Math.max(1, parseInt(page));
  const lim = Math.min(50, parseInt(limit));

  const [orders, total] = await Promise.all([
    LabOrder.find(filter)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
      .sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    LabOrder.countDocuments(filter),
  ]);
  res.json(new ApiResponse(200, { orders, total, page: pg, limit: lim }));
});
