import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import { AppModule } from 'src/app.module';
import { setupSwagger } from 'src/swagger';
import { WebSocketAdapter } from 'src/websocket/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 'loopback');

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(helmet());

  const webSocketAdapter = new WebSocketAdapter(app);
  await webSocketAdapter.connectToRedis();
  app.useWebSocketAdapter(webSocketAdapter);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
