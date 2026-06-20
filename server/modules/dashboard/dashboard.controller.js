import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Appointment from '../../models/Appointment.model.js';
import Patient from '../../models/Patient.model.js';
import Doctor from '../../models/Doctor.model.js';
import Admission from '../../models/Admission.model.js';
import Bed from '../../models/Bed.model.js';
import Ward from '../../models/Ward.model.js';
import Medicine from '../../models/Medicine.model.js';
import { ADMISSION_STATUS, BED_STATUS, APPOINTMENT_STATUS } from '../../config/constants.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  // ── Time boundaries ────────────────────────────────────────────────────────
  const now       = new Date();
  const todayStart = new Date(now); todayStart.setHours(0,  0,  0,  0);
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const weekStart  = new Date(now); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);

  // ── All queries in parallel ────────────────────────────────────────────────
  const [
    // Today
    todayAppointments,
    todayNewPatients,
    todayAdmissions,
    todayDischarges,
    // Totals
    totalPatients,
    totalDoctors,
    totalAppointments,
    activeAdmissions,
    // Beds
    totalBeds,
    availableBeds,
    occupiedBeds,
    // Weekly
    weeklyAppointments,
    weeklyCompleted,
    weeklyMissed,
    // Recent
    recentAppointments,
    recentAdmissions,
    recentPatients,
    // Overdue
    overdueAppointments,
    // Bed agg for low-bed wards
    bedAggByWard,
    allWards,
    lowStockCount,
  ] = await Promise.all([
    // Today
    Appointment.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
    Patient.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
    Admission.countDocuments({ admissionDate: { $gte: todayStart, $lte: todayEnd } }),
    Admission.countDocuments({ dischargeDate: { $gte: todayStart, $lte: todayEnd }, status: ADMISSION_STATUS.DISCHARGED }),

    // Totals
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Admission.countDocuments({ status: ADMISSION_STATUS.ADMITTED }),

    // Beds — real-time, no cache
    Bed.countDocuments(),
    Bed.countDocuments({ status: BED_STATUS.AVAILABLE }),
    Bed.countDocuments({ status: BED_STATUS.OCCUPIED }),

    // Weekly
    Appointment.countDocuments({ date: { $gte: weekStart, $lte: todayEnd } }),
    Appointment.countDocuments({ date: { $gte: weekStart, $lte: todayEnd }, status: APPOINTMENT_STATUS.COMPLETED }),
    Appointment.countDocuments({ date: { $gte: weekStart, $lte: todayEnd }, status: APPOINTMENT_STATUS.MISSED }),

    // Recent appointments
    Appointment.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
      .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName' }, select: 'userId specialization' }),

    // Recent admissions
    Admission.find()
      .sort({ admissionDate: -1 }).limit(5)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName' } })
      .populate('wardId', 'name type'),

    // Recent patients
    Patient.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate('userId', 'fullName email'),

    // Overdue scheduled appointments
    Appointment.countDocuments({
      date:   { $lt: todayStart },
      status: APPOINTMENT_STATUS.SCHEDULED,
    }),

    // Bed counts grouped by ward
    Bed.aggregate([
      { $group: { _id: '$wardId', total: { $sum: 1 }, available: { $sum: { $cond: [{ $eq: ['$status', BED_STATUS.AVAILABLE] }, 1, 0] } } } },
    ]),

    // All wards (for name lookup)
    Ward.find().select('_id name type'),

    // Low-stock medicines (reuses Medicine model — no second inventory system)
    Medicine.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$minStockLevel'] } }),
  ]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const occupancyRate      = totalBeds > 0 ? +((occupiedBeds / totalBeds) * 100).toFixed(2) : 0;
  const weeklyCompletionRate = weeklyAppointments > 0 ? +((weeklyCompleted / weeklyAppointments) * 100).toFixed(2) : 0;

  // Low bed wards: available < 20% of total
  const wardMap = Object.fromEntries(allWards.map((w) => [String(w._id), w]));
  const lowBedWards = bedAggByWard
    .filter((w) => w.total > 0 && (w.available / w.total) < 0.2)
    .map((w) => ({
      wardId:    w._id,
      wardName:  wardMap[String(w._id)]?.name || 'Unknown',
      wardType:  wardMap[String(w._id)]?.type || 'Unknown',
      total:     w.total,
      available: w.available,
      rate:      +((w.available / w.total) * 100).toFixed(1),
    }));

  res.status(200).json(new ApiResponse(200, {
    today: {
      appointments: todayAppointments,
      newPatients:  todayNewPatients,
      admissions:   todayAdmissions,
      discharges:   todayDischarges,
    },
    overview: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      activeAdmissions,
    },
    beds: {
      total:        totalBeds,
      available:    availableBeds,
      occupied:     occupiedBeds,
      occupancyRate,
    },
    weekly: {
      appointments:     weeklyAppointments,
      completed:        weeklyCompleted,
      missed:           weeklyMissed,
      completionRate:   weeklyCompletionRate,
    },
    recent: {
      appointments: recentAppointments,
      admissions:   recentAdmissions,
      patients:     recentPatients,
    },
    alerts: {
      lowBedWards,
      overdueAppointments,
      lowStockCount,
    },
  }));
});
