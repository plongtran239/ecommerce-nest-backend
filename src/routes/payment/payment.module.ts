import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { PaymentController } from 'src/routes/payment/payment.controller';
import { PaymentProducer } from 'src/routes/payment/payment.producer';
import { PaymentRepository } from 'src/routes/payment/payment.repository';
import { PaymentService } from 'src/routes/payment/payment.service';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, PaymentProducer],
})
export class PaymentModule {}
