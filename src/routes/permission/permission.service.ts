import { Injectable } from '@nestjs/common';

import { PermissionAlreadyExistsException } from 'src/routes/permission/permission.error';
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  UpdatePermissionBodyType,
} from 'src/routes/permission/permission.model';
import { PermissionRepository } from 'src/routes/permission/permission.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError, isPrismaUniqueConstrantError } from 'src/shared/helpers';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async create(payload: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepository.create(payload);
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
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
      return await this.permissionRepository.update(payload);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isPrismaUniqueConstrantError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(payload: { id: number; deletedById: number }) {
    try {
      await this.permissionRepository.delete(payload);

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
}
