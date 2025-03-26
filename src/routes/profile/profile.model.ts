import { z } from 'zod';

import { UserSchema } from 'src/shared/models/shared-user.model';

export const UpdateUserProfileBodySchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  avatar: true,
}).strict();

export const ChangePasswordBodySchema = UserSchema.pick({
  password: true,
})
  .extend({
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ password, newPassword, confirmPassword }, ctx) => {
    if (password === newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.NewPasswordSameAsCurrentPassword',
        path: ['newPassword'],
      });
    }

    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.ConfirmPasswordNotMatch',
        path: ['confirmPassword'],
      });
    }
  });

export type UpdateUserProfileBodyType = z.infer<typeof UpdateUserProfileBodySchema>;
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>;
