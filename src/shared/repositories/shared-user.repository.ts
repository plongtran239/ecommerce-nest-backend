import { Injectable } from '@nestjs/common';

import { PermissionType } from 'src/shared/models/shared-permission.model';
import { RoleType } from 'src/shared/models/shared-role.model';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

export type WhereUniqueUserType =
  | {
      id: number;
      [key: string]: any;
    }
  | {
      email: string;
      [key: string]: any;
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
    return this.prismaService.user.findUnique({
      where,
    });
  }

  async findUniqueWithRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findUnique({
      where,
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

  async update(where: WhereUniqueUserType, data: Partial<UserType>): Promise<UserType> {
    return this.prismaService.user.update({
      where,
      data,
    });
  }
}
