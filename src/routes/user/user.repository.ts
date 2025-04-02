import { Injectable } from '@nestjs/common';

import { CreateUserBodyType, GetUsersQueryType, GetUsersResType } from 'src/routes/user/user.model';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create({ data, createdById }: { data: CreateUserBodyType; createdById: number }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        role: true,
      },
    });
  }

  async list({ limit, page }: GetUsersQueryType): Promise<GetUsersResType> {
    const skip = limit * (page - 1);
    const take = limit;

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          role: true,
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

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<UserType> {
    if (isHard) {
      return this.prismaService.user.delete({
        where: {
          id,
        },
      });
    }

    return this.prismaService.user.update({
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
