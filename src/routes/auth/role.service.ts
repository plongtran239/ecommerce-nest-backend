import { Injectable } from '@nestjs/common';

import { RoleType } from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';

@Injectable()
export class RoleService {
  private clientRoleId: number | null = null;

  constructor(private readonly authRepository: AuthRepository) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role: RoleType = await this.authRepository.findRoleByName(RoleName.Client).then((roles: RoleType[]) => {
      if (roles.length === 0) {
        throw NotFoundRecordException;
      }

      return roles[0];
    });

    this.clientRoleId = role.id;

    return role.id;
  }
}
