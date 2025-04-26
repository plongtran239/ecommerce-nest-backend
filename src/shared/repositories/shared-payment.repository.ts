import { Injectable } from '@nestjs/common';

import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class SharedPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async cancelPaymentAndOrder(paymentId: number): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment) {
      throw NotFoundRecordException;
    }

    const { orders } = payment;

    const productSKUSnapshots = orders.map((order) => order.items).flat();

    await this.prisma.$transaction(async (tx) => {
      const updateOrder$ = tx.order.updateMany({
        where: {
          id: {
            in: orders.map((order) => order.id),
          },
          status: ORDER_STATUS.PENDING_PAYMENT,
          deletedAt: null,
        },
        data: {
          status: ORDER_STATUS.CANCELLED,
        },
      });

      const updateSKU$ = Promise.all(
        productSKUSnapshots
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
          id: paymentId,
        },
        data: {
          status: PAYMENT_STATUS.FAILED,
        },
      });

      return await Promise.all([updateOrder$, updateSKU$, updatePayment$]);
    });
  }
}
