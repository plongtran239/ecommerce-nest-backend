import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';

export const UserAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.UserAlreadyExists',
    path: 'email',
  },
]);

export const CannotCreateAdminUserException = new ForbiddenException('Error.CannotCreateAdminUser');

export const CannotUpdateAdminUserException = new ForbiddenException('Error.CannotUpdateAdminUser');

export const CannotDeleteAdminUserException = new ForbiddenException('Error.CannotDeleteAdminUser');

export const RoleNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.RoleNotFound',
    path: 'roleId',
  },
]);

// Không thể xóa hoặc cập nhật chính bản thân mình
export const CannotUpdateOrDeleteYourselfException = new ForbiddenException('Error.CannotUpdateOrDeleteYourself');
