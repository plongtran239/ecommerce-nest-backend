import { z } from 'zod';

import { UserStatus } from 'src/shared/constants/auth.constant';
import { PermissionSchema } from 'src/shared/models/shared-permission.model';
import { RoleSchema } from 'src/shared/models/shared-role.model';

export const UserSchema = z.object({
  id: z.number().positive(),
  email: z.string().email(),
  name: z.string().min(3).max(100),
  phoneNumber: z.string().min(9).max(15),
  password: z.string().min(6).max(100),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().positive().nullable(),
  updatedById: z.number().positive().nullable(),
  deletedById: z.number().positive().nullable(),
});

export const GetUserProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true,
      }),
    ),
  }),
});

export const UpdateUserProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type UserType = z.infer<typeof UserSchema>;
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;
export type UpdateUserProfileResType = z.infer<typeof UpdateUserProfileResSchema>;
