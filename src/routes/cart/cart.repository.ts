import { Injectable } from '@nestjs/common';

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
