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
        message: 'Password and confirm password must match',
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
  type: z.enum([TypeOfVerificationCode.FORGOT_PASSWORD, TypeOfVerificationCode.REGISTER]),
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
}).strict();

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

const RoleSchema = z.object({
  id: z.number().positive(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().positive().nullable(),
  updatedById: z.number().positive().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
});

const GetAuthorizationUrlResSchema = z.object({
  url: z.string(),
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
  RoleSchema,
  GoogleAuthStateSchema,
  GetAuthorizationUrlResSchema,
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
type RoleType = z.infer<typeof RoleSchema>;
type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>;
type GetAuthorizationUrlResType = z.infer<typeof GetAuthorizationUrlResSchema>;

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
  RoleType,
  GoogleAuthStateType,
  GetAuthorizationUrlResType,
};
