import { Injectable } from '@nestjs/common';

import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { PaymentRepository } from 'src/routes/payment/payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async receiver(body: WebhookPaymentBodyType) {
    return await this.paymentRepository.receiver(body);
  }
}
