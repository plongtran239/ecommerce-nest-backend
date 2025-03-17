import { Injectable } from '@nestjs/common';

import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  UpdatePermissionBodyType,
} from 'src/routes/permission/permission.model';
import { PermissionType } from 'src/shared/models/shared-permission.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create({
    data,
    createdById,
  }: {
    data: CreatePermissionBodyType;
    createdById: number;
  }): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async list({ limit, page }: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),
    ]);

    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findById(id: number): Promise<PermissionType | null> {
    return this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdatePermissionBodyType;
    updatedById: number;
  }): Promise<PermissionType> {
    return this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<PermissionType> {
    if (isHard) {
      return this.prismaService.permission.delete({
        where: {
          id,
        },
      });
    }

    return this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedById,
        deletedAt: new Date(),
      },
    });
  }
}
