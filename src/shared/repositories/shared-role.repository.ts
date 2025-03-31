import { Injectable } from '@nestjs/common';

import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class SharedRoleRepository {
  private clientRoleId: number | null = null;
  private adminRoleId: number | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    const role = await this.prismaService.role.findFirst({
      where: {
        name: roleName,
        deletedAt: null,
      },
    });

    if (!role) {
      throw NotFoundRecordException;
    }

    return role;
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role = await this.getRole(RoleName.Client);

    this.clientRoleId = role.id;

    return role.id;
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId;
    }

    const role = await this.getRole(RoleName.Admin);

    this.adminRoleId = role.id;

    return role.id;
  }
}
