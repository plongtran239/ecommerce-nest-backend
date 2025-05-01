import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class SharedWebSocketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { socketId: string; userId: number }) {
    return await this.prisma.websocket.create({
      data: {
        id: data.socketId,
        userId: data.userId,
      },
    });
  }

  async delete(socketId: string) {
    return await this.prisma.websocket.delete({
      where: {
        id: socketId,
      },
    });
  }
}
