import { Injectable } from '@nestjs/common';
import { parse } from 'date-fns';

import {
  CannotGetPaymentIdException,
  NotMatchPaymentAmountException,
  PaymentAlreadyProcessedException,
  PaymentNotFoundException,
  PaymentTransactionAlreadyExistsException,
} from 'src/routes/payment/payment.error';
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { PaymentProducer } from 'src/routes/payment/payment.producer';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/other.constant';
import { PAYMENT_STATUS, TRANSFER_TYPE } from 'src/shared/constants/payment.constant';
import { OrderIncludeProductSKUSnapshotType } from 'src/shared/models/shared-order.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProducer: PaymentProducer,
  ) {}

  private getTotalPrice(orders: OrderIncludeProductSKUSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((totalPrice, productSKU) => {
        return totalPrice + productSKU.skuPrice * productSKU.quantity;
      }, 0);
      return total + orderTotal;
    }, 0);
  }

  private async getAndValidatePaymentId(body: WebhookPaymentBodyType): Promise<{
    paymentId: number;
    orders: OrderIncludeProductSKUSnapshotType[];
  }> {
    const paymentId = body.code
      ? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1]);

    if (isNaN(paymentId)) {
      throw CannotGetPaymentIdException;
    }

    const paymentTransaction = await this.prisma.paymentTransaction.findUnique({
      where: {
        id: body.id,
      },
    });

    if (paymentTransaction) {
      throw PaymentTransactionAlreadyExistsException;
    }

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
      throw PaymentNotFoundException;
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw PaymentAlreadyProcessedException;
    }

    const orders = payment.orders as OrderIncludeProductSKUSnapshotType[];

    const totalPrice = this.getTotalPrice(orders);

    if (body.transferAmount !== totalPrice) {
      throw NotMatchPaymentAmountException({
        expectedAmount: totalPrice,
        transferAmount: body.transferAmount,
      });
    }

    return {
      paymentId,
      orders,
    };
  }

  async receiver(body: WebhookPaymentBodyType): Promise<void> {
    let amountIn = 0;
    let amountOut = 0;

    if (body.transferType === TRANSFER_TYPE.IN) {
      amountIn = body.transferAmount;
    } else if (body.transferType === TRANSFER_TYPE.OUT) {
      amountOut = body.transferAmount;
    }

    const { paymentId, orders } = await this.getAndValidatePaymentId(body);

    await this.prisma.$transaction(async (tx) => {
      const payment$ = tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PAYMENT_STATUS.SUCCESS,
        },
      });

      const paymentTransaction$ = this.prisma.paymentTransaction.create({
        data: {
          id: body.id,
          gateway: body.gateway,
          transactionDate: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
          accountNumber: body.accountNumber,
          accumulated: body.accumulated,
          amountIn,
          amountOut,
          code: body.code,
          transactionContent: body.content,
          referenceNumber: body.referenceCode,
          body: body.description,
          subAccount: body.subAccount,
        },
      });

      const order$ = tx.order.updateMany({
        where: {
          id: {
            in: orders.map((order) => order.id),
          },
        },
        data: {
          status: ORDER_STATUS.PENDING_PICKUP,
        },
      });

      const paymentJob$ = this.paymentProducer.removeCancelPaymentJob(paymentId);

      await Promise.all([payment$, paymentTransaction$, order$, paymentJob$]);
    });
  }
}
