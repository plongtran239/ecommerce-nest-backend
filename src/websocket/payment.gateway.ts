import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  namespace: 'payment',
})
export class PaymentGateway {}
