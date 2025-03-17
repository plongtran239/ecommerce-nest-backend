import { UnprocessableEntityException } from '@nestjs/common';

export const RoleAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.RoleAlreadyExists',
    path: 'name',
  },
]);
