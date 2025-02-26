import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import envConfig from 'src/shared/config';

@Injectable()
export class APIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const xAPIKey = request.headers['x-api-key'];

    if (!xAPIKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (xAPIKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
