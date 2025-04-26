import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { CANCEL_PAYMENT_DELAY, CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';
import { generateCancelPaymentJobId } from 'src/shared/helpers';

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private paymentQueue: Queue) {}

  async addCancelPaymentJob(paymentId: number) {
    await this.paymentQueue.add(
      CANCEL_PAYMENT_JOB_NAME,
      {
        paymentId,
      },
      {
        jobId: generateCancelPaymentJobId(paymentId),
        delay: CANCEL_PAYMENT_DELAY,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
