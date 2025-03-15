import { Module } from '@nestjs/common';

import { PermissionController } from 'src/routes/permission/permission.controller';
import { PermissionRepository } from 'src/routes/permission/permission.repository';
import { PermissionService } from 'src/routes/permission/permission.service';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
})
export class PermissionModule {}
