import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
} from 'src/routes/product/product.model';
import { ALL_LANGUAGE_CODE, OrderByType, SORT_BY, SortByType } from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async list({
    limit,
    page,
    createdById,
    isPublic,
    languageId,
    name,
    brandIds,
    categoryIds,
    minPrice,
    maxPrice,
    orderBy,
    sortBy,
  }: {
    limit: number;
    page: number;
    name?: string;
    brandIds?: number[];
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    createdById?: number;
    isPublic?: boolean;
    languageId: string;
    orderBy: OrderByType;
    sortBy: SortByType;
  }): Promise<GetProductsResType> {
    const skip = (page - 1) * limit;
    const take = limit;
    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById,
    };

    if (isPublic === true) {
      where.publishedAt = { lte: new Date(), not: null };
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [
          {
            publishedAt: null,
          },
          {
            publishedAt: { gt: new Date() },
          },
        ],
      };
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (brandIds && brandIds.length > 0) {
      where.brandId = {
        in: brandIds,
      };
    }

    if (categoryIds && categoryIds.length > 0) {
      where.categories = {
        some: {
          id: {
            in: categoryIds,
          },
        },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    let orderByClause: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: orderBy,
    };

    if (sortBy === SORT_BY.PRICE) {
      orderByClause = {
        basePrice: orderBy,
      };
    }

    if (sortBy === SORT_BY.SALE) {
      orderByClause = {
        orders: {
          _count: orderBy,
        },
      };
    }

    const [totalItems, data] = await Promise.all([
      this.prisma.product.count({
        where,
      }),
      this.prisma.product.findMany({
        where,
        include: {
          productTranslations: {
            where:
              languageId === ALL_LANGUAGE_CODE
                ? {
                    deletedAt: null,
                  }
                : {
                    deletedAt: null,
                    languageId,
                  },
          },
        },
        orderBy: orderByClause,
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

  async findDetail({
    id,
    languageId,
    isPublic,
  }: {
    id: number;
    languageId: string;
    isPublic?: boolean;
  }): Promise<GetProductDetailResType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id,
      deletedAt: null,
    };

    if (isPublic) {
      where.publishedAt = { lte: new Date(), not: null };
    } else {
      where = {
        ...where,
        OR: [
          {
            publishedAt: null,
          },
          {
            publishedAt: { gt: new Date() },
          },
        ],
      };
    }

    return await this.prisma.product.findUnique({
      where,
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        categories: {
          include: {
            categoryTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },
      },
    });
  }

  async findById(id: number): Promise<ProductType | null> {
    return await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create({
    data,
    createdById,
  }: {
    data: CreateProductBodyType;
    createdById: number;
  }): Promise<GetProductDetailResType> {
    const { skus, categories, ...productData } = data;

    return await this.prisma.product.create({
      data: {
        ...productData,
        createdById,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus,
          },
        },
      },
      include: {
        productTranslations: {
          where: {
            deletedAt: null,
          },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateProductBodyType;
    updatedById: number;
  }): Promise<ProductType> {
    const { skus: skusData, categories, ...productData } = data;

    const existingSKUs = await this.prisma.sKU.findMany({
      where: {
        productId: id,
        deletedAt: null,
      },
    });

    const skusToDelete = existingSKUs.filter((sku) => skusData.every((skuData) => skuData.value !== sku.value));

    const skuIdsToDelete = skusToDelete.map((sku) => sku.id);

    const skusWithId = skusData.map((skuData) => {
      const existingSKU = existingSKUs.find((sku) => sku.value === skuData.value);

      return {
        ...skuData,
        id: existingSKU ? existingSKU.id : null,
      };
    });

    const skusToUpdate = skusWithId.filter((sku) => sku.id !== null);

    const skusToCreate = skusWithId
      .filter((sku) => sku.id === null)
      .map(({ id: _, ...skuData }) => ({
        ...skuData,
        productId: id,
        createdById: updatedById,
      }));

    const [product] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...productData,
          updatedById,
          categories: {
            connect: categories.map((category) => ({ id: category })),
          },
        },
      }),

      this.prisma.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedAt: new Date(),
          deletedById: updatedById,
        },
      }),

      ...skusToUpdate.map((sku) =>
        this.prisma.sKU.update({
          where: {
            id: sku.id as number,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        }),
      ),

      this.prisma.sKU.createMany({
        data: skusToCreate,
      }),
    ]);

    return product;
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<ProductType> {
    const now = new Date();

    if (isHard) {
      const product = await this.prisma.product.delete({
        where: {
          id,
          deletedAt: null,
        },
      });

      return product;
    } else {
      const [product] = await Promise.all([
        this.prisma.product.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: now,
            deletedById,
          },
        }),
        this.prisma.sKU.updateMany({
          where: {
            productId: id,
            deletedAt: null,
          },
          data: {
            deletedAt: now,
            deletedById,
          },
        }),
        this.prisma.productTranslation.updateMany({
          where: {
            productId: id,
            deletedAt: null,
          },
          data: {
            deletedAt: now,
            deletedById,
          },
        }),
      ]);

      return product;
    }
  }
}
