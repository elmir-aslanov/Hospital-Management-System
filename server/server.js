import 'dotenv/config';
import http from 'http';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Stop the existing process or set a different PORT in .env`);
    } else {
      logger.error(`Server error: ${err.message}`);
    }
    process.exit(1);
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
