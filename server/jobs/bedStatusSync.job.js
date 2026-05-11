import { Queue, Worker } from 'bullmq';
import redis from '../config/redis.js';
import Admission from '../models/Admission.model.js';
import Bed from '../models/Bed.model.js';
import logger from '../utils/logger.js';
import { ADMISSION_STATUS, BED_STATUS } from '../config/constants.js';

const JOB_NAME = 'bed-status-sync';
const QUEUE_NAME = 'bed-status-sync';

export const bedStatusSyncQueue = new Queue(QUEUE_NAME, { connection: redis });

const processJob = async () => {
  let fixed = 0;

  // Fix 1: Admitted patient but bed shows available
  const activeAdmissions = await Admission.find({ status: ADMISSION_STATUS.ADMITTED }).populate('bedId');
  for (const admission of activeAdmissions) {
    const bed = admission.bedId;
    if (bed && bed.status === BED_STATUS.AVAILABLE) {
      await Bed.findByIdAndUpdate(bed._id, {
        status: BED_STATUS.OCCUPIED,
        currentPatientId: admission.patientId,
      });
      fixed++;
      logger.warn(`[BedSync] Fixed bed ${bed._id} — was available but patient admitted`);
    }
  }

  // Fix 2: Bed occupied but no patient linked
  const orphanedBeds = await Bed.find({ status: BED_STATUS.OCCUPIED, currentPatientId: null });
  for (const bed of orphanedBeds) {
    await Bed.findByIdAndUpdate(bed._id, { status: BED_STATUS.AVAILABLE });
    fixed++;
    logger.warn(`[BedSync] Fixed bed ${bed._id} — was occupied but no patient assigned`);
  }

  logger.info(`[BedSync] Sync complete — ${fixed} record(s) fixed`);
};

export const bedStatusSyncWorker = new Worker(
  QUEUE_NAME,
  async () => {
    await processJob();
  },
  { connection: redis }
);

bedStatusSyncWorker.on('completed', () => logger.info('[BedSync] Job completed'));
bedStatusSyncWorker.on('failed', (_, err) => logger.error(`[BedSync] Job failed: ${err.message}`));

// Run every 6 hours
const scheduleSixHourly = async () => {
  await bedStatusSyncQueue.add(JOB_NAME, {}, {
    repeat: { every: 6 * 60 * 60 * 1000 },
    removeOnComplete: true,
    removeOnFail: 50,
  });
  logger.info('[BedSync] Worker started — runs every 6h');
};

scheduleSixHourly().catch((err) => logger.error(`[BedSync] Schedule error: ${err.message}`));
