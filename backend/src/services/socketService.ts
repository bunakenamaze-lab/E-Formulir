import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const connectedUsers = new Map<string, string>(); // userId -> socketId

export const setupSocketIO = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        (socket as any).userId = decoded.id;
        next();
      } catch (err) {
        // Allow connection but without authentication
        next();
      }
    } else {
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;

    if (userId) {
      connectedUsers.set(userId, socket.id);
      logger.info(`User ${userId} connected via WebSocket`);

      socket.join(`user:${userId}`);
    }

    socket.on('join:form', (formId: string) => {
      socket.join(`form:${formId}`);
      logger.info(`Socket ${socket.id} joined form room: ${formId}`);
    });

    socket.on('leave:form', (formId: string) => {
      socket.leave(`form:${formId}`);
    });

    socket.on('disconnect', () => {
      if (userId) {
        connectedUsers.delete(userId);
        logger.info(`User ${userId} disconnected`);
      }
    });
  });

  return io;
};

// Emit to specific user
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Emit to all users watching a form
export const emitToForm = (io: Server, formId: string, event: string, data: any) => {
  io.to(`form:${formId}`).emit(event, data);
};

// Emit to all connected users
export const emitToAll = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};
