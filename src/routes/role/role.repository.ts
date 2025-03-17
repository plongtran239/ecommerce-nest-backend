import { Injectable } from '@nestjs/common';

import { GetPermissionsQueryType } from 'src/routes/permission/permission.model';
import {
  CreateRoleBodyType,
  GetRolesResType,
  RoleWithPermissionsType,
  UpdateRoleBodyType,
} from 'src/routes/role/role.model';
import { RoleType } from 'src/shared/models/shared-role.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }): Promise<RoleType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async list({ limit, page }: GetPermissionsQueryType): Promise<GetRolesResType> {
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
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

  async findById(id: number): Promise<RoleWithPermissionsType | null> {
    return this.prismaService.role.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        permissions: true,
      },
    });
  }

  async findByName(name: string): Promise<RoleType[]> {
    return this.prismaService.$queryRaw`
      SELECT * FROM "Role" 
      WHERE name = ${name} 
      AND "deletedAt" IS NULL
      LIMIT 1
    `;
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateRoleBodyType;
    updatedById: number;
  }): Promise<RoleWithPermissionsType> {
    return this.prismaService.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: true,
      },
    });
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<RoleType> {
    if (isHard) {
      return this.prismaService.role.delete({
        where: {
          id,
        },
      });
    }

    return this.prismaService.role.update({
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
