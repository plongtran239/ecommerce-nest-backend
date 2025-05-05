import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { PaymentRepository } from 'src/routes/payment/payment.repository';
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant';
import { generateUserIdRoom } from 'src/shared/helpers';

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server;

  constructor(private readonly paymentRepository: PaymentRepository) {}

  async receiver(body: WebhookPaymentBodyType) {
    const { userId, paymentId } = await this.paymentRepository.receiver(body);

    this.server.to(generateUserIdRoom(userId)).emit('payment', {
      paymentId,
      status: PAYMENT_STATUS.SUCCESS,
      message: 'Make payment successfully',
    });

    return {
      message: 'Make payment successfully',
    };
  }
}
