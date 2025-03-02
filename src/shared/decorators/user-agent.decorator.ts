import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserAgent = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();

  return request.headers['user-agent'] as string;
});
