import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

import { createClient } from 'redis';
import { Server, ServerOptions, Socket } from 'socket.io';
import envConfig from 'src/shared/config';
import { generateUserIdRoom } from 'src/shared/helpers';
import { TokenService } from 'src/shared/services/token.service';

export class WebSocketAdapter extends IoAdapter {
  private readonly tokenServive: TokenService;
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(app: INestApplicationContext) {
    super(app);
    this.tokenServive = app.get(TokenService);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: envConfig.REDIS_URL });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => {
      console.error('Redis Pub Client Error:', err);
    });

    subClient.on('error', (err) => {
      console.error('Redis Sub Client Error:', err);
    });

    pubClient.on('ready', () => {
      console.log('Redis Pub Client is ready');
    });

    subClient.on('ready', () => {
      console.log('Redis Sub Client is ready');
    });

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
      console.log('✅ Redis connected successfully');

      this.adapterConstructor = createAdapter(pubClient, subClient);
    } catch (err) {
      console.error('❌ Redis connection failed:', err);
      throw err;
    }
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

      await socket.join(generateUserIdRoom(userId));

      next();
    } catch (error) {
      return next(error as Error);
    }
  }
}
