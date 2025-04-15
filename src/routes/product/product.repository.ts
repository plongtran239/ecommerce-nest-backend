import { Injectable } from '@nestjs/common';

import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
} from 'src/routes/product/product.model';
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async list(query: GetProductsQueryType, languageId: string): Promise<GetProductsResType> {
    const { page, limit } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    const [totalItems, data] = await Promise.all([
      this.prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prisma.product.findMany({
        where: {
          deletedAt: null,
        },
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
        orderBy: {
          createdAt: 'desc',
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

  async findById(id: number, languageId: string): Promise<GetProductDetailResType | null> {
    return await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
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
      const [product] = await Promise.all([
        this.prisma.product.delete({
          where: {
            id,
            deletedAt: null,
          },
        }),
        this.prisma.sKU.deleteMany({
          where: {
            productId: id,
            deletedAt: null,
          },
        }),
      ]);

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
      ]);

      return product;
    }
  }
}
