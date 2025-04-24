import { Body, Controller, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

import { WebhookPaymentBodyDTO } from 'src/routes/payment/payment.dto';
import { PaymentService } from 'src/routes/payment/payment.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('receiver')
  @Auth([AuthType.PaymentAPIKey])
  @ZodSerializerDto(MessageResDTO)
  async receiver(@Body() body: WebhookPaymentBodyDTO) {
    return await this.paymentService.receiver(body);
  }
}
