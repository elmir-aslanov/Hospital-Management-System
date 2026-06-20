import asyncHandler  from '../../utils/asyncHandler.js';
import ApiResponse   from '../../utils/ApiResponse.js';
import ApiError      from '../../utils/ApiError.js';
import Appointment   from '../../models/Appointment.model.js';
import MedicalRecord from '../../models/MedicalRecord.model.js';
import Doctor        from '../../models/Doctor.model.js';
import Patient       from '../../models/Patient.model.js';
import LabOrder      from '../../models/LabOrder.model.js';
import * as appointmentsService from '../appointments/appointments.service.js';
import * as prescriptionsService from '../prescriptions/prescriptions.service.js';

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
  const doctor = req.user.role === 'DOCTOR'
    ? await getDoctorDoc(req.user.id)
    : null;
  const result = await prescriptionsService.getPatientPrescriptions(req.params.id, {
    ...req.query,
    viewerRole: req.user.role,
    doctorId: doctor?._id,
  });
  res.json(new ApiResponse(200, result.prescriptions));
});

export const createPrescription = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDoc(req.user.id);
  const {
    visitId,
    patientId,
    medicine,
    dose,
    frequency,
    duration,
    instructions,
    note,
    medications,
    notes,
  } = req.body;

  const normalizedMedications = Array.isArray(medications)
    ? medications
    : [{
        name: medicine,
        dosage: dose,
        frequency,
        duration,
        instructions: instructions || note,
      }];

  if (
    !visitId
    || !patientId
    || normalizedMedications.length === 0
    || normalizedMedications.some((item) =>
      !item?.name?.trim()
      || !item?.dosage?.trim()
      || !item?.frequency?.trim()
      || !item?.duration?.trim()
      || !item?.instructions?.trim()
    )
  ) {
    throw new ApiError(
      400,
      'visitId, patientId and complete medication instructions are required'
    );
  }

  const prescription = await prescriptionsService.createPrescription({
    visitId,
    patientId,
    medications: normalizedMedications,
    notes: notes ?? note,
  }, doctor._id, req, req.user.id);

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

// ─── Check-in / queue workflow ───────────────────────────────────────────────

export const startMyConsultation = asyncHandler(async (req, res) => {
  const isPrivileged = req.user.role !== 'DOCTOR';
  const actingDoctorId = isPrivileged ? null : (await getDoctorDoc(req.user.id))._id;
  const appointment = await appointmentsService.startConsultation(
    req.params.id, { actingDoctorId, isPrivileged }, req.user.id, req
  );
  res.json(new ApiResponse(200, appointment, 'Consultation started'));
});

export const completeMyConsultation = asyncHandler(async (req, res) => {
  const isPrivileged = req.user.role !== 'DOCTOR';
  const actingDoctorId = isPrivileged ? null : (await getDoctorDoc(req.user.id))._id;
  const appointment = await appointmentsService.completeAppointment(
    req.params.id, { actingDoctorId, isPrivileged }, req.user.id, req
  );
  res.json(new ApiResponse(200, appointment, 'Consultation completed'));
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
