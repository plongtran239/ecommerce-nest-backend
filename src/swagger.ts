import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import { patchNestJsSwagger } from 'nestjs-zod';

import envConfig from 'src/shared/config';
import { NODE_ENV } from 'src/shared/constants/other.constant';

export function setupSwagger(app: INestApplication): void {
  if (envConfig.NODE_ENV === NODE_ENV.PRODUCTION) {
    app.use(
      ['/documentation', '/documentation-json'], // Paths to protect
      expressBasicAuth({
        users: {
          [envConfig.SWAGGER_USERNAME]: envConfig.SWAGGER_PASSWORD,
        },
        challenge: true,
      }),
    );
  }

  patchNestJsSwagger();

  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('')
    .addBearerAuth()
    .addApiKey(
      {
        name: 'authorization',
        type: 'apiKey',
      },
      'payment-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
