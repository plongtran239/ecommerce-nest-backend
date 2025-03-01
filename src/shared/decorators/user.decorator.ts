import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { REQUEST_USER_KEY } from 'src/shared/constants/auth.constant';
import { TokenPayload } from 'src/shared/types/jwt.type';

export const User = createParamDecorator((field: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const token: TokenPayload | undefined = request[REQUEST_USER_KEY];

  return field ? token?.[field] : token;
});
