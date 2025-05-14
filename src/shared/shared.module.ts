import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { PaymentAPIKeyGuard } from 'src/shared/guards/payment-api-key.guard';
import { SharedPaymentRepository } from 'src/shared/repositories/shared-payment.repository';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repository';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository';
import { SharedWebSocketRepository } from 'src/shared/repositories/shared-websocket.repository';
import { TwoFactorAuthService } from 'src/shared/services/2fa.service';
import { EmailService } from 'src/shared/services/email.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { S3Service } from 'src/shared/services/s3.service';
import { TokenService } from 'src/shared/services/token.service';

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  TwoFactorAuthService,
  S3Service,
  SharedUserRepository,
  SharedRoleRepository,
  SharedPaymentRepository,
  SharedWebSocketRepository,
];

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    PaymentAPIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
})
export class SharedModule {}
