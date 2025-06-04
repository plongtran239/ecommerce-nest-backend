import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { Cache } from 'cache-manager';
import { PermissionAlreadyExistsException } from 'src/routes/permission/permission.error';
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  UpdatePermissionBodyType,
} from 'src/routes/permission/permission.model';
import { PermissionRepository } from 'src/routes/permission/permission.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { generateCacheKeyRole, isPrismaNotFoundError, isPrismaUniqueConstraintError } from 'src/shared/helpers';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(payload: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepository.create(payload);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async getList(query: GetPermissionsQueryType) {
    return this.permissionRepository.list(query);
  }

  async getById(id: number) {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw NotFoundRecordException;
    }

    return permission;
  }

  async update(payload: { id: number; data: UpdatePermissionBodyType; updatedById: number }) {
    try {
      const permission = await this.permissionRepository.update(payload);

      await this.deleteCachedRoles(permission.roles);

      return permission;
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isPrismaUniqueConstraintError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(payload: { id: number; deletedById: number }) {
    try {
      const permission = await this.permissionRepository.delete(payload);

      await this.deleteCachedRoles(permission.roles);

      return {
        message: 'Delete permission successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  private async deleteCachedRoles(roles: { id: number }[]) {
    await Promise.all(
      roles.map((role) => {
        const cacheKey = generateCacheKeyRole(role.id);
        return this.cacheManager.del(cacheKey);
      }),
    );
  }
}
