import { UserStatus } from 'src/shared/constants/auth.constant';
import { z } from 'zod';

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
});

export type UserType = z.infer<typeof UserSchema>;
