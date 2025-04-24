import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import envConfig from 'src/shared/config';

@Injectable()
export class PaymentAPIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const xAPIKey = request.headers['payment-api-key'];

    if (!xAPIKey) {
      throw new UnauthorizedException('Payment API key is required');
    }

    if (xAPIKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException('Invalid Payment API key');
    }

    return true;
  }
}
