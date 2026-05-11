import { Queue, Worker } from 'bullmq';
import redis from '../config/redis.js';
import Appointment from '../models/Appointment.model.js';
import { createNotification } from '../modules/notifications/notifications.service.js';
import logger from '../utils/logger.js';

const JOB_NAME = 'send-appointment-reminders';
const QUEUE_NAME = 'appointment-reminders';

export const appointmentReminderQueue = new Queue(QUEUE_NAME, { connection: redis });

const processJob = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const start = new Date(tomorrow); start.setHours(0, 0, 0, 0);
  const end   = new Date(tomorrow); end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    date:   { $gte: start, $lte: end },
    status: 'scheduled',
  })
    .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName _id' } })
    .populate({ path: 'doctorId',  populate: { path: 'userId', select: 'fullName _id' } });

  logger.info(`[AppointmentReminder] Found ${appointments.length} appointments for tomorrow`);

  for (const appt of appointments) {
    const patientUserId = appt.patientId?.userId?._id;
    const doctorUserId  = appt.doctorId?.userId?._id;
    const doctorName    = appt.doctorId?.userId?.fullName || 'your doctor';
    const patientName   = appt.patientId?.userId?.fullName || 'your patient';

    if (patientUserId) {
      await createNotification({
        userId:  patientUserId,
        title:   'Appointment Reminder',
        message: `You have an appointment tomorrow at ${appt.startTime} with Dr. ${doctorName}`,
        type:    'appointment',
        link:    `/appointments/${appt._id}`,
      });
    }

    if (doctorUserId) {
      await createNotification({
        userId:  doctorUserId,
        title:   'Appointment Reminder',
        message: `You have an appointment tomorrow at ${appt.startTime} with patient ${patientName}`,
        type:    'appointment',
        link:    `/appointments/${appt._id}`,
      });
    }
  }
};

export const appointmentReminderWorker = new Worker(
  QUEUE_NAME,
  async () => {
    await processJob();
  },
  { connection: redis }
);

appointmentReminderWorker.on('completed', () => logger.info('[AppointmentReminder] Job completed'));
appointmentReminderWorker.on('failed', (_, err) => logger.error(`[AppointmentReminder] Job failed: ${err.message}`));

// Add initial job and schedule every 24 hours
const scheduleDaily = async () => {
  await appointmentReminderQueue.add(JOB_NAME, {}, {
    repeat: { every: 24 * 60 * 60 * 1000 },
    removeOnComplete: true,
    removeOnFail: 50,
  });
  logger.info('[AppointmentReminder] Worker started — runs every 24h');
};

scheduleDaily().catch((err) => logger.error(`[AppointmentReminder] Schedule error: ${err.message}`));
