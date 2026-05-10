import { Server } from 'socket.io';
import logger from '../utils/logger.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;

    if (userId) {
      // Each user joins their own private room for targeted notifications
      socket.join(`user:${userId}`);
      logger.info(`Socket connected — user:${userId}`);
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected — user:${userId}`);
    });
  });

  return io;
};

// Call this anywhere in the codebase to emit events to a specific user
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
