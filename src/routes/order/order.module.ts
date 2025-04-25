import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { OrderController } from 'src/routes/order/order.controller';
import { OrderRepository } from 'src/routes/order/order.repository';
import { OrderService } from 'src/routes/order/order.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payment',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}
