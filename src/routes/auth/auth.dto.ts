import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

import {
  DisableTwoFactorBodySchema,
  ForgotPasswordBodySchema,
  GetAuthorizationUrlResSchema,
  LoginBodySchema,
  LoginResSchema,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  RegisterBodySchema,
  RegisterResSchema,
  SendOTPBodySchema,
  TwoFactorSetupResSchema,
} from 'src/routes/auth/auth.model';
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {
  @ApiProperty({
    example: 'plongtran239@gmail.com',
  })
  email: string;

  @ApiProperty({
    example: 'Tran Phuoc Long',
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    example: '0123456789',
    minLength: 9,
    maxLength: 15,
  })
  phoneNumber: string;

  @ApiProperty({
    example: '12341234',
    minLength: 6,
    maxLength: 100,
  })
  password: string;

  @ApiProperty({
    example: '12341234',
    minLength: 6,
    maxLength: 100,
  })
  confirmPassword: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  code: string;
}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {
  @ApiProperty({
    example: 'plongtran239@gmail.com',
  })
  email: string;

  @ApiProperty({
    enum: TypeOfVerificationCode,
    example: TypeOfVerificationCode.REGISTER,
  })
  type: TypeOfVerificationCodeType;
}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {
  @ApiProperty({
    example: 'plongtran239@gmail.com',
  })
  email: string;

  @ApiProperty({
    example: '12341234',
    minLength: 6,
    maxLength: 100,
  })
  password: string;
}

export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {
  @ApiProperty({
    example: '',
  })
  refreshToken: string;
}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {
  @ApiProperty({
    example: '',
  })
  refreshToken: string;
}

export class GetAuthorizationUrlResDTO extends createZodDto(GetAuthorizationUrlResSchema) {}

export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {
  @ApiProperty({
    example: '',
  })
  email: string;

  @ApiProperty({
    example: '123456',
  })
  code: string;

  @ApiProperty({
    example: '12341234',
  })
  password: string;

  @ApiProperty({
    example: '12341234',
  })
  confirmPassword: string;
}

export class DisableTwoFactorBodyDTO extends createZodDto(DisableTwoFactorBodySchema) {}

export class TwoFactorSetupResDTO extends createZodDto(TwoFactorSetupResSchema) {}
