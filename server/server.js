import 'dotenv/config';
import http from 'http';
import dns from 'dns';

// Force Google DNS to fix querySrv ECONNREFUSED on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  // Initialize Socket.io
  initSocket(httpServer);
  logger.info('Socket.io initialized');

  // Start BullMQ workers (only if Redis is configured)
  if (process.env.REDIS_URL) {
    try {
      const { appointmentReminderWorker } = await import('./jobs/appointmentReminder.job.js');
      const { missedAppointmentWorker }   = await import('./jobs/missedAppointment.job.js');
      const { bedStatusSyncWorker }       = await import('./jobs/bedStatusSync.job.js');

      logger.info(`[Worker] appointmentReminderWorker: ${appointmentReminderWorker.isRunning() ? 'running' : 'started'}`);
      logger.info(`[Worker] missedAppointmentWorker:   ${missedAppointmentWorker.isRunning()   ? 'running' : 'started'}`);
      logger.info(`[Worker] bedStatusSyncWorker:       ${bedStatusSyncWorker.isRunning()       ? 'running' : 'started'}`);
    } catch (err) {
      logger.warn(`BullMQ workers skipped: ${err.message}`);
    }
  }

  httpServer.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

start();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});
