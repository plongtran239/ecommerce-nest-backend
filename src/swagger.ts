import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import { patchNestJsSwagger } from 'nestjs-zod';

import envConfig from 'src/shared/config';

export function setupSwagger(app: INestApplication): void {
  app.use(
    ['/documentation', '/documentation-json'], // Paths to protect
    expressBasicAuth({
      users: {
        [envConfig.SWAGGER_USERNAME]: envConfig.SWAGGER_PASSWORD,
      },
      challenge: true,
    }),
  );

  patchNestJsSwagger();

  const documentBuilder = new DocumentBuilder().setTitle('E-commerce API').setDescription('').addBearerAuth().addApiKey(
    {
      name: 'authorization',
      type: 'apiKey',
    },
    'payment-api-key',
  );

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
