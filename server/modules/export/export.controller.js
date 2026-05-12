import asyncHandler from '../../utils/asyncHandler.js';
import Patient from '../../models/Patient.model.js';
import Appointment from '../../models/Appointment.model.js';
import Medicine from '../../models/Medicine.model.js';
import AuditLog from '../../models/AuditLog.model.js';
import {
  exportPatientsToExcel,
  exportAppointmentsToExcel,
  exportInventoryToExcel,
  exportAuditLogToExcel,
} from '../../utils/exportToExcel.js';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const todayStr = () => new Date().toISOString().slice(0, 10);

const sendExcel = (res, buffer, filename) => {
  res.setHeader('Content-Type', XLSX_CONTENT_TYPE);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
};

const dateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }
  return filter;
};

export const exportPatients = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = dateFilter(startDate, endDate);

  const patients = await Patient.find(filter)
    .populate('userId', 'fullName email phone')
    .sort({ createdAt: -1 });

  const buffer = exportPatientsToExcel(patients);
  sendExcel(res, buffer, `patients-${todayStr()}.xlsx`);
});

export const exportAppointments = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, doctorId } = req.query;
  const filter = {};
  if (status)   filter.status   = status;
  if (doctorId) filter.doctorId = doctorId;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  const appointments = await Appointment.find(filter)
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
    .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization' })
    .sort({ date: -1 });

  const buffer = exportAppointmentsToExcel(appointments);
  sendExcel(res, buffer, `appointments-${todayStr()}.xlsx`);
});

export const exportInventory = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ isActive: true }).sort({ name: 1 });
  const buffer = exportInventoryToExcel(medicines);
  sendExcel(res, buffer, `inventory-${todayStr()}.xlsx`);
});

export const exportAuditLog = asyncHandler(async (req, res) => {
  const { startDate, endDate, action, userId } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (userId) filter.userId = userId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  const logs = await AuditLog.find(filter)
    .populate('userId', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(10000); // safety cap

  const buffer = exportAuditLogToExcel(logs);
  sendExcel(res, buffer, `audit-log-${todayStr()}.xlsx`);
});
