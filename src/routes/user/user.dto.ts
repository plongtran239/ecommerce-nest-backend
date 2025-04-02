import { createZodDto } from 'nestjs-zod';

import {
  CreateUserBodySchema,
  CreateUserResSchema,
  GetDetailUserResSchema,
  GetUserParamsSchema,
  GetUsersQuerySchema,
  GetUsersResSchema,
  UpdateUserBodySchema,
  UpdateUserResSchema,
} from 'src/routes/user/user.model';

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}

export class CreateUserResDTO extends createZodDto(CreateUserResSchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}

export class UpdateUserResDTO extends createZodDto(UpdateUserResSchema) {}

export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}

export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}

export class GetUsersResDTO extends createZodDto(GetUsersResSchema) {}

export class GetDetailUserResDTO extends createZodDto(GetDetailUserResSchema) {}
