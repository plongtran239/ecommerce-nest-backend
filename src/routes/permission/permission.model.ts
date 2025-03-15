import { z } from 'zod';

import { HTTPMethod } from 'src/shared/constants/role.constant';
import { PaginationSchema } from 'src/shared/models/pagination.model';

export const PermissionSchema = z.object({
  id: z.number().positive(),
  name: z.string().max(500),
  description: z.string().optional(),
  path: z.string().max(1000),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

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

export type PermissionType = z.infer<typeof PermissionSchema>;
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type CreatePermissionResType = z.infer<typeof CreatePermissionResSchema>;
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>;
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>;
export type GetPermisstionParamsType = z.infer<typeof GetPermisstionParamsSchema>;
export type GetDetailPermissionResType = z.infer<typeof GetDetailPermissionResSchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;
export type UpdatePermissionResType = z.infer<typeof UpdatePermissionResSchema>;
