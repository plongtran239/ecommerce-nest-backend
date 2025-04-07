import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from 'src/app.module';
import { setupSwagger } from 'src/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*',
    },
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
