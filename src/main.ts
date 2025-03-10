import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/app.module';
import { setupSwagger } from 'src/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
    },
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
