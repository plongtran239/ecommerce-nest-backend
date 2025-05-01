import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { PaymentRepository } from 'src/routes/payment/payment.repository';
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant';
import { SharedWebSocketRepository } from 'src/shared/repositories/shared-websocket.repository';

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly sharedWebsocketRepository: SharedWebSocketRepository,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const { userId, paymentId } = await this.paymentRepository.receiver(body);

    try {
      const sockets = await this.sharedWebsocketRepository.findManyByUserId(userId);

      sockets.forEach((socket) => {
        this.server.to(socket.id).emit('payment', {
          paymentId,
          status: PAYMENT_STATUS.SUCCESS,
          message: 'Make payment successfully',
        });
      });
    } catch (error) {
      console.error({ error });
    }

    return {
      message: 'Make payment successfully',
    };
  }
}
