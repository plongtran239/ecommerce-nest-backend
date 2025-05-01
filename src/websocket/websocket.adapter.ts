import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

import { Server, ServerOptions } from 'socket.io';
import { Socket } from 'socket.io';
import { SharedWebSocketRepository } from 'src/shared/repositories/shared-websocket.repository';
import { TokenService } from 'src/shared/services/token.service';

export class WebSocketAdapter extends IoAdapter {
  private readonly sharedWebsocketRepository: SharedWebSocketRepository;
  private readonly tokenServive: TokenService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.sharedWebsocketRepository = app.get(SharedWebSocketRepository);
    this.tokenServive = app.get(TokenService);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credential: true,
      },
    });

    server.use((socket, next) => {
      void this.authMiddlware(socket, next);
    });

    server.of(/.*/).use((socket, next) => {
      void this.authMiddlware(socket, next);
    });

    return server;
  }

  async authMiddlware(socket: Socket, next: (err?: Error) => void) {
    const { authorization } = socket.handshake.headers;
    if (!authorization) {
      return next(new Error('Missing authorization header'));
    }

    const accessToken = authorization.split(' ')[1];
    if (!accessToken) {
      return next(new Error('Missing access token'));
    }

    console.log(`Client with id ${socket.id} connected to namespace ${socket.nsp.name}`);

    try {
      const { userId } = await this.tokenServive.verifyAccessToken(accessToken);

      await this.sharedWebsocketRepository.create({ socketId: socket.id, userId });

      next();

      socket.on('disconnect', async () => {
        console.log(`Client with id ${socket.id} disconnected from namespace ${socket.nsp.name}`);
        await this.sharedWebsocketRepository.delete(socket.id).catch(() => {});
      });
    } catch (error) {
      return next(error as Error);
    }
  }
}
