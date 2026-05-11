import { Queue, Worker } from 'bullmq';
import redis from '../config/redis.js';
import Appointment from '../models/Appointment.model.js';
import logger from '../utils/logger.js';

const JOB_NAME = 'mark-missed-appointments';
const QUEUE_NAME = 'missed-appointments';

export const missedAppointmentQueue = new Queue(QUEUE_NAME, { connection: redis });

const processJob = async () => {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);

  const result = await Appointment.updateMany(
    {
      date:   { $lt: todayStart },
      status: 'scheduled',
    },
    { $set: { status: 'missed' } }
  );

  if (result.modifiedCount > 0) {
    logger.info(`[MissedAppointment] Marked ${result.modifiedCount} appointments as missed`);
  }
};

export const missedAppointmentWorker = new Worker(
  QUEUE_NAME,
  async () => {
    await processJob();
  },
  { connection: redis }
);

missedAppointmentWorker.on('completed', () => logger.info('[MissedAppointment] Job completed'));
missedAppointmentWorker.on('failed', (_, err) => logger.error(`[MissedAppointment] Job failed: ${err.message}`));

// Run every hour
const scheduleHourly = async () => {
  await missedAppointmentQueue.add(JOB_NAME, {}, {
    repeat: { every: 60 * 60 * 1000 },
    removeOnComplete: true,
    removeOnFail: 50,
  });
  logger.info('[MissedAppointment] Worker started — runs every 1h');
};

scheduleHourly().catch((err) => logger.error(`[MissedAppointment] Schedule error: ${err.message}`));
