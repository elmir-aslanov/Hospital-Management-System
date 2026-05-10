import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Attach Socket.io to the HTTP server
initSocket(server);

const start = async () => {
  await connectDB();

  // TODO: import and start BullMQ workers here
  // e.g. import { startEmailWorker } from './workers/email.worker.js';
  // startEmailWorker();

  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

start();

// Graceful shutdown on unhandled errors
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});
