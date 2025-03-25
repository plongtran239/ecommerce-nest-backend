import { Injectable } from '@nestjs/common';

import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from 'src/routes/role/role.error';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model';
import { RoleRepository } from 'src/routes/role/role.repository';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError, isPrismaUniqueConstrantError } from 'src/shared/helpers';
import { RoleType } from 'src/shared/models/shared-role.model';

@Injectable()
export class RoleService {
  private clientRoleId: number | null = null;

  constructor(private readonly roleRepository: RoleRepository) {}

  async create(payload: { data: CreateRoleBodyType; createdById: number }) {
    try {
      return this.roleRepository.create(payload);
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

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

  async getList(query: GetRolesQueryType) {
    return this.roleRepository.list(query);
  }

  async getById(id: number) {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw NotFoundRecordException;
    }

    return role;
  }

  async update(payload: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      await this.verifyRole(payload.id);

      return await this.roleRepository.update(payload);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isPrismaUniqueConstrantError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(payload: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(payload.id);

      await this.roleRepository.delete(payload);

      return {
        message: 'Delete role successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  private async verifyRole(roleId: number) {
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw NotFoundRecordException;
    }

    const baseRoles: string[] = [RoleName.Client, RoleName.Seller, RoleName.Admin];

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException;
    }
  }
}
