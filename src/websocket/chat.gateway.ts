import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('send-message')
  handleSendMessage(@MessageBody() message: string): void {
    this.server.emit('receive-message', {
      data: message,
      timestamp: new Date().toISOString(),
    });
  }
}
