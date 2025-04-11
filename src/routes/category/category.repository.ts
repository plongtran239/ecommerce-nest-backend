import { Injectable } from '@nestjs/common';

import {
  CategoryIncludeTranslationType,
  CategoryType,
  CreateCategoryBodyType,
  GetCategoriesResType,
  UpdateCategoryBodyType,
} from 'src/routes/category/category.model';
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private prismaService: PrismaService) {}

  async list(parentCategoryId: number | null, languageId: string): Promise<GetCategoriesResType> {
    const [totalItems, data] = await Promise.all([
      this.prismaService.category.count({
        where: {
          deletedAt: null,
          parentCategoryId: parentCategoryId ?? null,
        },
      }),
      this.prismaService.category.findMany({
        where: {
          deletedAt: null,
          parentCategoryId: parentCategoryId ?? null,
        },
        include: {
          categoryTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      data,
      totalItems,
    };
  }

  findById(id: number, languageId: string): Promise<CategoryIncludeTranslationType | null> {
    return this.prismaService.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number | null;
    data: CreateCategoryBodyType;
  }): Promise<CategoryIncludeTranslationType> {
    return this.prismaService.category.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        categoryTranslations: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number;
    updatedById: number;
    data: UpdateCategoryBodyType;
  }): Promise<CategoryIncludeTranslationType> {
    return this.prismaService.category.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        categoryTranslations: {
          where: { deletedAt: null },
        },
      },
    });
  }

  delete(
    {
      id,
      deletedById,
    }: {
      id: number;
      deletedById: number;
    },
    isHard?: boolean,
  ): Promise<CategoryType> {
    return isHard
      ? this.prismaService.category.delete({
          where: {
            id,
          },
        })
      : this.prismaService.category.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        });
  }
}
