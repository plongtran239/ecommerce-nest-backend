import { Injectable } from '@nestjs/common';

import { PermissionType } from 'src/shared/models/shared-permission.model';
import { RoleType } from 'src/shared/models/shared-role.model';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

export type WhereUniqueUserType =
  | {
      id: number;
    }
  | {
      email: string;
    };

type UserIncludeRolePermissionsType = UserType & {
  role: RoleType & {
    permissions: PermissionType[];
  };
};

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  async findUniqueWithRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  async update(where: { id: number }, data: Partial<UserType>): Promise<UserType> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    });
  }
}
