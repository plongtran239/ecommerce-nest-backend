import { Injectable } from '@nestjs/common';

import { AuthRepository } from 'src/routes/auth/auth.repository';
import { ROLE } from 'src/shared/constants/role.constant';

@Injectable()
export class RoleService {
  private clientRoleId: number | null = null;

  constructor(private readonly authRepository: AuthRepository) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role = await this.authRepository.findRoleByName(ROLE.Client);

    this.clientRoleId = role.id;

    return role.id;
  }
}
