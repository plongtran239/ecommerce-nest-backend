import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { Cache } from 'cache-manager';
import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from 'src/routes/role/role.error';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model';
import { RoleRepository } from 'src/routes/role/role.repository';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { generateCacheKeyRole, isPrismaNotFoundError, isPrismaUniqueConstraintError } from 'src/shared/helpers';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(payload: { data: CreateRoleBodyType; createdById: number }) {
    try {
      return this.roleRepository.create(payload);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
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

      const updatedRole = await this.roleRepository.update(payload);

      await this.deleteCachedRole(updatedRole.id);

      return updatedRole;
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isPrismaUniqueConstraintError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(payload: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(payload.id);

      const deletedRole = await this.roleRepository.delete(payload);

      await this.deleteCachedRole(deletedRole.id);

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

  private async deleteCachedRole(roleId: number) {
    const cacheKey = generateCacheKeyRole(roleId);
    await this.cacheManager.del(cacheKey);
  }
}
