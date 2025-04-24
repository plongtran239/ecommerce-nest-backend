import { Injectable } from '@nestjs/common';
import { parse } from 'date-fns';

import {
  CannotGetPaymentIdException,
  NotMatchPaymentAmountException,
  PaymentNotFoundException,
} from 'src/routes/payment/payment.error';
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/other.constant';
import { PAYMENT_STATUS, TRANSFER_TYPE } from 'src/shared/constants/payment.constant';
import { MessageResType } from 'src/shared/models/response.model';
import { OrderIncludeProductSKUSnapshotType } from 'src/shared/models/shared-order.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getTotalPrice(orders: OrderIncludeProductSKUSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((totalPrice, productSKU) => {
        return totalPrice + productSKU.skuPrice * productSKU.quantity;
      }, 0);
      return total + orderTotal;
    }, 0);
  }

  async receiver(body: WebhookPaymentBodyType): Promise<MessageResType> {
    let amountIn = 0;
    let amountOut = 0;

    if (body.transferType === TRANSFER_TYPE.IN) {
      amountIn = body.transferAmount;
    } else if (body.transferType === TRANSFER_TYPE.OUT) {
      amountOut = body.transferAmount;
    }

    await this.prisma.paymentTransaction.create({
      data: {
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

    const paymentId = body.code
      ? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1]);

    if (isNaN(paymentId)) {
      throw CannotGetPaymentIdException;
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

    const orders = payment.orders as OrderIncludeProductSKUSnapshotType[];

    const totalPrice = this.getTotalPrice(orders);

    if (body.transferAmount !== totalPrice) {
      throw NotMatchPaymentAmountException({
        expectedAmount: totalPrice,
        transferAmount: body.transferAmount,
      });
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PAYMENT_STATUS.SUCCESS,
        },
      }),

      this.prisma.order.updateMany({
        where: {
          id: {
            in: orders.map((order) => order.id),
          },
        },
        data: {
          status: ORDER_STATUS.PENDING_PICKUP,
        },
      }),
    ]);

    return {
      message: 'Payment successful',
    };
  }
}
