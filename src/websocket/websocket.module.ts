import { Module } from '@nestjs/common';

import { ChatGateway } from 'src/websocket/chat.gateway';
import { PaymentGateway } from 'src/websocket/payment.gateway';

@Module({
  providers: [ChatGateway, PaymentGateway],
})
export class WebSocketModule {}
