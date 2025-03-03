import { Module } from '@nestjs/common';

import { AuthController } from 'src/routes/auth/auth.controller';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { AuthService } from 'src/routes/auth/auth.service';
import { GoogleService } from 'src/routes/auth/google.service';
import { RoleService } from 'src/routes/auth/role.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RoleService, GoogleService, AuthRepository],
})
export class AuthModule {}
