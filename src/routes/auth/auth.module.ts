import { Module } from '@nestjs/common';

import { AuthController } from 'src/routes/auth/auth.controller';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { AuthService } from 'src/routes/auth/auth.service';
import { RoleService } from 'src/routes/auth/role.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RoleService, AuthRepository],
})
export class AuthModule {}
