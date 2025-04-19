import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  NotEnoughStockSKUException,
  NotFoundProductException,
  NotFoundSKUException,
  OutOfStockSKUException,
} from 'src/routes/cart/cart.error';
import {
  AddToCartBodyType,
  CartItemDetailType,
  CartItemType,
  DeleteCartBodyType,
  GetCartResType,
  UpdateCartItemBodyType,
} from 'src/routes/cart/cart.model';
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant';
import { PaginationQueryType } from 'src/shared/models/pagination.model';
import { SKUType } from 'src/shared/models/shared-sku.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private prisma: PrismaService) {}

  private async validateSKU(skuId: number, quantity: number): Promise<SKUType> {
    const sku = await this.prisma.sKU.findUnique({
      where: {
        id: skuId,
        deletedAt: null,
      },
      include: {
        product: true,
      },
    });

    if (!sku) {
      throw NotFoundSKUException;
    }

    // Check if sku is out of stock
    if (sku.stock < 1) {
      throw OutOfStockSKUException;
    }

    // Check if sku has enough stock
    if (sku.stock < quantity) {
      throw NotEnoughStockSKUException;
    }

    const { product } = sku;

    // Check if product is published or deleted
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt !== null && product.publishedAt > new Date())
    ) {
      throw NotFoundProductException;
    }

    return sku;
  }

  async findAll({ page, limit }: PaginationQueryType, userId: number, languageId: string): Promise<GetCartResType> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
        sku: {
          product: {
            deletedAt: null,
            publishedAt: {
              lte: new Date(),
              not: null,
            },
          },
        },
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: {
                  where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
                },
                createdBy: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const groupMap = new Map<number, CartItemDetailType>();

    for (const cartItem of cartItems) {
      const shopId = cartItem.sku.product.createdById;

      if (shopId && cartItem.sku.product.createdBy) {
        if (!groupMap.has(shopId)) {
          groupMap.set(shopId, {
            shop: {
              ...cartItem.sku.product.createdBy,
            },
            cartItems: [],
          });
        }
        groupMap.get(shopId)?.cartItems.push(cartItem);
      }
    }
    const sortedGroups = Array.from(groupMap.values());

    const skip = (page - 1) * limit;
    const take = limit;
    const totalGroups = sortedGroups.length;
    const pagedGroups = sortedGroups.slice(skip, skip + take);

    return {
      data: pagedGroups,
      totalItems: totalGroups,
      page,
      limit,
      totalPages: Math.ceil(totalGroups / limit),
    };
  }

  async list({ page, limit }: PaginationQueryType, userId: number, languageId: string): Promise<GetCartResType> {
    const skip = (page - 1) * limit;
    const take = limit;
    // Đếm tổng số nhóm sản phẩm
    const totalItems$ = this.prisma.$queryRaw<{ createdById: number }[]>`
      SELECT
        "Product"."createdById"
      FROM "CartItem"
      JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
      JOIN "Product" ON "SKU"."productId" = "Product"."id"
      WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
      GROUP BY "Product"."createdById"
    `;
    const data$ = await this.prisma.$queryRaw<CartItemDetailType[]>`
     SELECT
       "Product"."createdById",
       json_agg(
         jsonb_build_object(
           'id', "CartItem"."id",
           'quantity', "CartItem"."quantity",
           'skuId', "CartItem"."skuId",
           'userId', "CartItem"."userId",
           'createdAt', "CartItem"."createdAt",
           'updatedAt', "CartItem"."updatedAt",
           'sku', jsonb_build_object(
             'id', "SKU"."id",
              'value', "SKU"."value",
              'price', "SKU"."price",
              'stock', "SKU"."stock",
              'image', "SKU"."image",
              'productId', "SKU"."productId",
              'product', jsonb_build_object(
                'id', "Product"."id",
                'publishedAt', "Product"."publishedAt",
                'name', "Product"."name",
                'basePrice', "Product"."basePrice",
                'virtualPrice', "Product"."virtualPrice",
                'brandId', "Product"."brandId",
                'images', "Product"."images",
                'variants', "Product"."variants",
                'productTranslations', COALESCE((
                  SELECT json_agg(
                    jsonb_build_object(
                      'id', pt."id",
                      'productId', pt."productId",
                      'languageId', pt."languageId",
                      'name', pt."name",
                      'description', pt."description"
                    )
                  ) FILTER (WHERE pt."id" IS NOT NULL)
                  FROM "ProductTranslation" pt
                  WHERE pt."productId" = "Product"."id"
                    AND pt."deletedAt" IS NULL
                    ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND pt."languageId" = ${languageId}`}
                ), '[]'::json)
              )
           )
         )
       ) AS "cartItems",
       jsonb_build_object(
         'id', "User"."id",
         'name', "User"."name",
         'avatar', "User"."avatar"
       ) AS "shop"
     FROM "CartItem"
     JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
     JOIN "Product" ON "SKU"."productId" = "Product"."id"
     LEFT JOIN "ProductTranslation" ON "Product"."id" = "ProductTranslation"."productId"
       AND "ProductTranslation"."deletedAt" IS NULL
       ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND "ProductTranslation"."languageId" = ${languageId}`}
     LEFT JOIN "User" ON "Product"."createdById" = "User"."id"
     WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
     GROUP BY "Product"."createdById", "User"."id"
     ORDER BY MAX("CartItem"."updatedAt") DESC
      LIMIT ${take} 
      OFFSET ${skip}
   `;
    const [data, totalItems] = await Promise.all([data$, totalItems$]);
    return {
      data,
      page,
      limit,
      totalItems: totalItems.length,
      totalPages: Math.ceil(totalItems.length / limit),
    };
  }

  async findUnique(
    where: { id: number } | { userId_skuId: { skuId: number; userId: number } },
  ): Promise<CartItemType | null> {
    return await this.prisma.cartItem.findUnique({
      where,
    });
  }

  async create({ data, userId }: { data: AddToCartBodyType; userId: number }): Promise<CartItemType> {
    const { skuId, quantity } = data;

    await this.validateSKU(skuId, quantity);

    return await this.prisma.cartItem.create({
      data: {
        skuId,
        quantity,
        userId,
      },
    });
  }

  async update({
    cartItemId,
    data,
    userId,
  }: {
    cartItemId: number;
    data: UpdateCartItemBodyType;
    userId: number;
  }): Promise<CartItemType> {
    const { skuId, quantity } = data;

    await this.validateSKU(skuId, quantity);

    return await this.prisma.cartItem.update({
      where: { id: cartItemId, userId },
      data: {
        skuId,
        quantity,
      },
    });
  }

  async delete({ body, userId }: { body: DeleteCartBodyType; userId: number }): Promise<{ count: number }> {
    return await this.prisma.cartItem.deleteMany({
      where: {
        id: { in: body.cartItemIds },
        userId,
      },
    });
  }
}
