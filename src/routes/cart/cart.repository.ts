import { Injectable } from '@nestjs/common';

import {
  NotEnoughStockSKUException,
  NotFoundProductException,
  NotFoundSKUException,
  OutOfStockSKUException,
} from 'src/routes/cart/cart.error';
import {
  AddToCartBodyType,
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
    const take = limit;
    const skip = (page - 1) * limit;

    const [totalItems, cartItems] = await Promise.all([
      this.prisma.cartItem.count({
        where: {
          userId,
        },
      }),
      this.prisma.cartItem.findMany({
        where: {
          userId,
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where:
                      languageId === ALL_LANGUAGE_CODE
                        ? { deletedAt: null }
                        : {
                            languageId,
                            deletedAt: null,
                          },
                  },
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      data: cartItems,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
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
