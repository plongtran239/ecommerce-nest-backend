import { z } from 'zod';

import { PaginationSchema } from 'src/shared/models/pagination.model';
import { PermissionSchema } from 'src/shared/models/shared-permission.model';

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
}).strict();

export const CreatePermissionResSchema = PermissionSchema;

export const GetPermissionsQuerySchema = PaginationSchema.pick({
  page: true,
  limit: true,
});

export const GetPermissionsResSchema = PaginationSchema.extend({
  data: z.array(PermissionSchema),
  totalItems: z.number().int().positive(),
});

export const GetPermisstionParamsSchema = z.object({
  permissionId: z.coerce.number().positive(),
});

export const GetDetailPermissionResSchema = PermissionSchema;

export const UpdatePermissionBodySchema = CreatePermissionBodySchema;

export const UpdatePermissionResSchema = PermissionSchema;

export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type CreatePermissionResType = z.infer<typeof CreatePermissionResSchema>;
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>;
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>;
export type GetPermisstionParamsType = z.infer<typeof GetPermisstionParamsSchema>;
export type GetDetailPermissionResType = z.infer<typeof GetDetailPermissionResSchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;
export type UpdatePermissionResType = z.infer<typeof UpdatePermissionResSchema>;
