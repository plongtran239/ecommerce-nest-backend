import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from 'src/app.module';
import { setupSwagger } from 'src/swagger';
import { WebSocketAdapter } from 'src/websocket/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*',
    },
  });

  app.useWebSocketAdapter(new WebSocketAdapter(app));

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
