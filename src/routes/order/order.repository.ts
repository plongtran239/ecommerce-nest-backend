import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  CannotCancelOrderException,
  NotFoundCartItemException,
  OutOfStockSKUException,
  ProductNotFoundException,
  SKUNotBelongToShopException,
} from 'src/routes/order/order.error';
import {
  CancelOrderResType,
  CreateOrderBodyType,
  CreateOrderResType,
  GetOrderDetailResType,
  GetOrderListQueryType,
  GetOrderListResType,
} from 'src/routes/order/order.model';
import { OrderProducer } from 'src/routes/order/order.producer';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}

  async list({ query, userId }: { query: GetOrderListQueryType; userId: number }): Promise<GetOrderListResType> {
    const { page, limit, status } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.OrderWhereInput = {
      userId,
      status: status as Prisma.EnumOrderStatusFilter,
    };

    const [totalItems, data] = await Promise.all([
      this.prisma.order.count({
        where,
      }),
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      data,
      totalItems,
      limit,
      page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async create({ data, userId }: { data: CreateOrderBodyType; userId: number }): Promise<CreateOrderResType> {
    const allCartItemIds = data.map((item) => item.cartItemIds).flat();

    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        id: {
          in: allCartItemIds,
        },
        userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    });

    if (allCartItemIds.length !== cartItems.length) {
      throw NotFoundCartItemException;
    }

    const isOutOfStock = cartItems.some((item) => item.sku.stock < item.quantity);

    if (isOutOfStock) {
      throw OutOfStockSKUException;
    }

    const isExistNotAvailableProduct = cartItems.some(
      (item) =>
        item.sku.product.deletedAt !== null ||
        item.sku.product.publishedAt === null ||
        item.sku.product.publishedAt > new Date(),
    );

    if (isExistNotAvailableProduct) {
      throw ProductNotFoundException;
    }

    const cartItemMap = new Map<number, (typeof cartItems)[0]>();

    cartItems.forEach((item) => {
      cartItemMap.set(item.id, item);
    });

    const isValidShop = data.every((item) => {
      const bodyCartItemIds = item.cartItemIds;
      return bodyCartItemIds.every((cartItemId) => {
        const cartItem = cartItemMap.get(cartItemId)!;
        return item.shopId === cartItem.sku.createdById;
      });
    });

    if (!isValidShop) {
      throw SKUNotBelongToShopException;
    }

    const orders = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          status: PAYMENT_STATUS.PENDING,
        },
        select: {
          id: true,
        },
      });

      const orders$ = Promise.all(
        data.map((item) =>
          tx.order.create({
            data: {
              userId,
              status: ORDER_STATUS.PENDING_PAYMENT,
              receiver: item.receiver,
              createdById: userId,
              shopId: item.shopId,
              paymentId: payment.id,
              items: {
                create: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!;
                  return {
                    productName: cartItem.sku.product.name,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    skuId: cartItem.sku.id,
                    skuValue: cartItem.sku.value,
                    quantity: cartItem.quantity,
                    productId: cartItem.sku.product.id,
                    productTranslations: cartItem.sku.product.productTranslations.map((translation) => {
                      return {
                        id: translation.id,
                        name: translation.name,
                        description: translation.description,
                        languageId: translation.languageId,
                      };
                    }),
                  };
                }),
              },
              products: {
                connect: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!;
                  return {
                    id: cartItem.sku.product.id,
                  };
                }),
              },
            },
          }),
        ),
      );

      const cartItem$ = tx.cartItem.deleteMany({
        where: {
          id: {
            in: allCartItemIds,
          },
        },
      });

      const skus$ = Promise.all(
        cartItems.map((item) =>
          tx.sKU.update({
            where: {
              id: item.sku.id,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );

      const addCancelPaymentJob$ = this.orderProducer.addCancelPaymentJob(payment.id);

      const [orders] = await Promise.all([orders$, cartItem$, skus$, addCancelPaymentJob$]);

      return orders;
    });

    return {
      data: orders,
    };
  }

  async findById({ userId, orderId }: { userId: number; orderId: number }): Promise<GetOrderDetailResType | null> {
    return await this.prisma.order.findUnique({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });
  }

  async cancel({ userId, orderId }: { userId: number; orderId: number }): Promise<CancelOrderResType> {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
    });

    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
      throw CannotCancelOrderException;
    }

    return await this.prisma.order.update({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
      data: {
        status: ORDER_STATUS.CANCELLED,
        updatedById: userId,
      },
    });
  }
}
