import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { REQUEST_ROLE_PERMISSIONS_KEY } from 'src/shared/constants/auth.constant';
import { RoleWithPermissionsType } from 'src/shared/models/shared-role.model';

export const Role = createParamDecorator((field: keyof RoleWithPermissionsType | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const rolePermissions: RoleWithPermissionsType = request[REQUEST_ROLE_PERMISSIONS_KEY];

  return field ? rolePermissions?.[field] : rolePermissions;
});
