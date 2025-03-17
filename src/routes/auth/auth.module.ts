import { Module } from '@nestjs/common';

import { AuthController } from 'src/routes/auth/auth.controller';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { AuthService } from 'src/routes/auth/auth.service';
import { GoogleService } from 'src/routes/auth/google.service';
import { RoleRepository } from 'src/routes/role/role.repository';
import { RoleService } from 'src/routes/role/role.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleService, AuthRepository, RoleService, RoleRepository],
})
export class AuthModule {}
