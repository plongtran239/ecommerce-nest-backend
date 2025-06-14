import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from 'src/app.module';
import envConfig from 'src/shared/config';
import { NODE_ENV } from 'src/shared/constants/other.constant';
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor';
import { setupSwagger } from 'src/swagger';
import { WebSocketAdapter } from 'src/websocket/websocket.adapter';

async function bootstrap() {
  const isProduction = envConfig.NODE_ENV === NODE_ENV.PRODUCTION;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: isProduction,
  });

  app.useGlobalInterceptors(new LoggingInterceptor());

  if (isProduction) {
    app.useLogger(app.get(Logger));
  }

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

void bootstrap();
