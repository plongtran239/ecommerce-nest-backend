import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import requestIp, { Request } from 'request-ip';

export const IP = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();

  const clientIP = requestIp.getClientIp(request as Request) as string;

  return clientIP;
});
