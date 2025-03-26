import { z } from 'zod';

import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import { UserSchema } from 'src/shared/models/shared-user.model';

const RegisterBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  password: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.ConfirmPasswordNotMatch',
        path: ['confirmPassword'],
      });
    }
  });

const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

const VerificationCodeSchema = z.object({
  id: z.number().positive(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([
    TypeOfVerificationCode.FORGOT_PASSWORD,
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.LOGIN,
    TypeOfVerificationCode.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .extend({
    totpCode: z.string().length(6).optional(), //2FA code
    code: z.string().length(6).optional(), //Email OTP code
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    if (totpCode !== undefined && code !== undefined) {
      const message = 'Only provide 2FA code or OTP code. Not both';

      ctx.addIssue({
        code: 'custom',
        message,
        path: ['totpCode'],
      });

      ctx.addIssue({
        code: 'custom',
        message,
        path: ['code'],
      });
    }
  });

const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number().positive(),
  deviceId: z.number().positive(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

const RefreshTokenBodySchema = z.object({
  refreshToken: z.string().nonempty(),
});

const RefreshTokenResSchema = LoginResSchema;

const LogoutBodySchema = RefreshTokenBodySchema;

const DeviceSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
});

const GetAuthorizationUrlResSchema = z.object({
  url: z.string(),
});

const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password must match',
        path: ['confirmPassword'],
      });
    }
  });

const DisableTwoFactorBodySchema = z
  .object({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    if ((totpCode !== undefined) === (code !== undefined)) {
      const message = 'Only provide 2FA code or OTP code. Not both';

      ctx.addIssue({
        code: 'custom',
        message,
        path: ['totpCode'],
      });

      ctx.addIssue({
        code: 'custom',
        message,
        path: ['code'],
      });
    }
  });

const TwoFactorSetupResSchema = z.object({
  secret: z.string(),
  uri: z.string(),
});

export {
  RegisterBodySchema,
  RegisterResSchema,
  VerificationCodeSchema,
  SendOTPBodySchema,
  LoginBodySchema,
  LoginResSchema,
  RefreshTokenSchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  LogoutBodySchema,
  DeviceSchema,
  GoogleAuthStateSchema,
  GetAuthorizationUrlResSchema,
  ForgotPasswordBodySchema,
  DisableTwoFactorBodySchema,
  TwoFactorSetupResSchema,
};

type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
type RegisterResType = z.infer<typeof RegisterResSchema>;
type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
type LoginBodyType = z.infer<typeof LoginBodySchema>;
type LoginResType = z.infer<typeof LoginResSchema>;
type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>;
type LogoutBodyType = z.infer<typeof LogoutBodySchema>;
type DeviceType = z.infer<typeof DeviceSchema>;
type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>;
type GetAuthorizationUrlResType = z.infer<typeof GetAuthorizationUrlResSchema>;
type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;
type DisableTwoFactorBodyType = z.infer<typeof DisableTwoFactorBodySchema>;
type TwoFactorSetupResType = z.infer<typeof TwoFactorSetupResSchema>;

export type {
  RegisterBodyType,
  RegisterResType,
  VerificationCodeType,
  SendOTPBodyType,
  LoginBodyType,
  LoginResType,
  RefreshTokenType,
  RefreshTokenBodyType,
  RefreshTokenResType,
  LogoutBodyType,
  DeviceType,
  GoogleAuthStateType,
  GetAuthorizationUrlResType,
  ForgotPasswordBodyType,
  DisableTwoFactorBodyType,
  TwoFactorSetupResType,
};
