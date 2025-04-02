import { z } from 'zod';

import { PermissionSchema } from 'src/shared/models/shared-permission.model';

export const RoleSchema = z.object({
  id: z.number().positive(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().positive().nullable(),
  updatedById: z.number().positive().nullable(),
  deletedById: z.number().positive().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export type RoleType = z.infer<typeof RoleSchema>;
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>;
