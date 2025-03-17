import { Module } from '@nestjs/common';

import { RoleController } from 'src/routes/role/role.controller';
import { RoleRepository } from 'src/routes/role/role.repository';
import { RoleService } from 'src/routes/role/role.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
})
export class RoleModule {}
