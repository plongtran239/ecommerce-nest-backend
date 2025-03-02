import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constant';
import { AccessTokenPayload } from 'src/shared/types/jwt.type';

export const User = createParamDecorator((field: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const token: AccessTokenPayload | undefined = request[REQUEST_USER_KEY];

  return field ? token?.[field] : token;
});
