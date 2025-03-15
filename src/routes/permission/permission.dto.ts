import { createZodDto } from 'nestjs-zod';

import {
  CreatePermissionBodySchema,
  CreatePermissionResSchema,
  GetDetailPermissionResSchema,
  GetPermissionsQuerySchema,
  GetPermissionsResSchema,
  GetPermisstionParamsSchema,
  UpdatePermissionBodySchema,
  UpdatePermissionResSchema,
} from 'src/routes/permission/permission.model';

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}

export class CreatePermissionResDTO extends createZodDto(CreatePermissionResSchema) {}

export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}

export class GetPermissionsResDTO extends createZodDto(GetPermissionsResSchema) {}

export class GetPermisstionParamsDTO extends createZodDto(GetPermisstionParamsSchema) {}

export class GetDetailPermissionResDTO extends createZodDto(GetDetailPermissionResSchema) {}

export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

export class UpdatePermissionResDTO extends createZodDto(UpdatePermissionResSchema) {}
