import { Injectable } from '@nestjs/common';

import { RoleRepository } from 'src/routes/role/role.repository';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { RoleType } from 'src/shared/models/shared-role.model';

@Injectable()
export class RoleService {
  private clientRoleId: number | null = null;

  constructor(private readonly roleRepository: RoleRepository) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role: RoleType = await this.roleRepository.findByName(RoleName.Client).then((roles: RoleType[]) => {
      if (roles.length === 0) {
        throw NotFoundRecordException;
      }

      return roles[0];
    });

    this.clientRoleId = role.id;

    return role.id;
  }
}
