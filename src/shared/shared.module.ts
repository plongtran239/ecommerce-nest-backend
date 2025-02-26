import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { HasingService } from './services/hasing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { APIKeyGuard } from 'src/shared/guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

const sharedServices = [PrismaService, HasingService, TokenService];

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
})
export class SharedModule {}
