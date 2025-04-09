import { z } from 'zod';

import { PaginationSchema } from 'src/shared/models/pagination.model';
import { UserSchema } from 'src/shared/models/shared-user.model';

const UserResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: UserSchema.pick({
    id: true,
    name: true,
  }),
});

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  password: true,
  roleId: true,
  status: true,
}).strict();

export const CreateUserResSchema = UserResSchema;

export const UpdateUserBodySchema = CreateUserBodySchema;

export const UpdateUserResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export const GetUsersQuerySchema = PaginationSchema.pick({
  page: true,
  limit: true,
}).strict();

export const GetUserParamsSchema = z
  .object({
    userId: z.coerce.number().positive(),
  })
  .strict();

export const GetUsersResSchema = PaginationSchema.extend({
  data: z.array(UserResSchema),
  totalItems: z.number().int(),
});

export const GetDetailUserResSchema = UserResSchema;

export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;
export type CreateUserResType = z.infer<typeof CreateUserResSchema>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;
export type UpdateUserResType = z.infer<typeof UpdateUserResSchema>;
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>;
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>;
export type GetUsersResType = z.infer<typeof GetUsersResSchema>;
export type GetDetailUserResType = z.infer<typeof GetDetailUserResSchema>;
