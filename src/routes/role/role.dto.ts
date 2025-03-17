import { createZodDto } from 'nestjs-zod';

import {
  CreateRoleBodySchema,
  CreateRoleResSchema,
  GetDetailRoleResSchema,
  GetRoleParamsSchema,
  GetRolesQuerySchema,
  GetRolesResSchema,
  UpdateRoleBodySchema,
  UpdateRoleResSchema,
} from 'src/routes/role/role.model';

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}

export class CreateRoleResDTO extends createZodDto(CreateRoleResSchema) {}

export class GetRolesQueryDTO extends createZodDto(GetRolesQuerySchema) {}

export class GetRolesResDTO extends createZodDto(GetRolesResSchema) {}

export class GetRoleParamsDTO extends createZodDto(GetRoleParamsSchema) {}

export class GetDetailRoleResDTO extends createZodDto(GetDetailRoleResSchema) {}

export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}

export class UpdateRoleResDTO extends createZodDto(UpdateRoleResSchema) {}
