import { IoAdapter } from '@nestjs/platform-socket.io';

import { Server, ServerOptions } from 'socket.io';
import { Socket } from 'socket.io';

export class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credential: true,
      },
    });

    const authMiddlware = (socket: Socket, next: (err?: Error) => void) => {
      console.log(`Client with id ${socket.id} connected to namespace ${socket.nsp.name}`);

      socket.on('disconnect', () => {
        console.log(`Client with id ${socket.id} disconnected from namespace ${socket.nsp.name}`);
      });

      next();
    };

    server.use(authMiddlware);
    server.of(/.*/).use(authMiddlware);

    return server;
  }
}
