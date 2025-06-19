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
import { PaymentProducer } from 'src/routes/payment/payment.producer';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant';
import { VersionConflictException } from 'src/shared/error';
import { generateSkuIdLock, isPrismaNotFoundError } from 'src/shared/helpers';
import { redlock } from 'src/shared/redis';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderProducer: OrderProducer,
    private readonly paymentProducer: PaymentProducer,
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

    const cartItemWithSkuId = await this.prisma.cartItem.findMany({
      where: {
        id: {
          in: allCartItemIds,
        },
        userId,
      },
      select: {
        skuId: true,
      },
    });

    const skuIds = cartItemWithSkuId.map((item) => item.skuId);

    // Lock all SKUs to prevent concurrent updates in 3 seconds
    const locks = await Promise.all(skuIds.map((skuId) => redlock.acquire([generateSkuIdLock(skuId)], 3000)));

    try {
      const orders = await this.prisma.$transaction(async (tx) => {
        const cartItems = await tx.cartItem.findMany({
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

        const payment = await tx.payment.create({
          data: {
            status: PAYMENT_STATUS.PENDING,
          },
          select: {
            id: true,
          },
        });

        const orders: CreateOrderResType['data'] = [];

        for (const item of data) {
          const order = await tx.order.create({
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
          });
          orders.push(order);
        }

        await tx.cartItem.deleteMany({
          where: {
            id: {
              in: allCartItemIds,
            },
          },
        });

        for (const cartItem of cartItems) {
          await tx.sKU
            .update({
              where: {
                id: cartItem.sku.id,
                updatedAt: cartItem.sku.updatedAt,
                stock: {
                  gte: cartItem.quantity,
                },
              },
              data: {
                stock: {
                  decrement: cartItem.quantity,
                },
              },
            })
            .catch((e) => {
              if (isPrismaNotFoundError(e)) {
                throw VersionConflictException;
              }
              throw e;
            });
        }

        await this.orderProducer.addCancelPaymentJob(payment.id);

        return orders;
      });

      return {
        data: orders,
      };
    } finally {
      // Release all locks
      await Promise.all(locks.map((lock) => lock.release().catch(() => {})));
    }
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
      include: {
        items: true,
      },
    });

    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
      throw CannotCancelOrderException;
    }

    const [cancelledOrder] = await this.prisma.$transaction(async (tx) => {
      const updateOrder$ = tx.order.update({
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

      const updateSKU$ = Promise.all(
        order.items
          .filter((item) => item.skuId)
          .map((item) => {
            return tx.sKU.update({
              where: {
                id: item.skuId as number,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }),
      );

      const updatePayment$ = tx.payment.update({
        where: {
          id: order.paymentId,
        },
        data: {
          status: PAYMENT_STATUS.FAILED,
        },
      });

      const removePaymentJob$ = this.paymentProducer.removeCancelPaymentJob(order.paymentId);

      return Promise.all([updateOrder$, updateSKU$, updatePayment$, removePaymentJob$]);
    });

    return cancelledOrder;
  }
}
