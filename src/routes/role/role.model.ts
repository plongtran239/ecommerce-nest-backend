import { z } from 'zod';

import { PaginationSchema } from 'src/shared/models/pagination.model';
import { PermissionSchema } from 'src/shared/models/shared-permission.model';
import { RoleSchema } from 'src/shared/models/shared-role.model';

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).strict();

export const CreateRoleResSchema = RoleSchema;

export const GetRolesQuerySchema = PaginationSchema.pick({
  page: true,
  limit: true,
}).strict();

export const GetRolesResSchema = PaginationSchema.extend({
  data: z.array(RoleSchema),
  totalItems: z.number().int().positive(),
});

export const GetRoleParamsSchema = z.object({
  roleId: z.coerce.number().positive(),
});

export const GetDetailRoleResSchema = RoleWithPermissionsSchema;

export const UpdateRoleBodySchema = CreateRoleBodySchema.extend({
  permissionIds: z.array(z.number().positive()),
}).strict();

export const UpdateRoleResSchema = RoleWithPermissionsSchema;

export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>;
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;
export type CreateRoleResType = z.infer<typeof CreateRoleResSchema>;
export type GetRolesQueryType = z.infer<typeof GetRolesQuerySchema>;
export type GetRolesResType = z.infer<typeof GetRolesResSchema>;
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>;
export type GetDetailRoleResType = z.infer<typeof GetDetailRoleResSchema>;
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>;
export type UpdateRoleResType = z.infer<typeof UpdateRoleResSchema>;
