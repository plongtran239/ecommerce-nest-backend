import { HttpException, Injectable } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';

import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  UnauthorizedAccessException,
} from 'src/routes/auth/error.model';
import { RoleService } from 'src/routes/auth/role.service';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';
import { generateOTPCode, isPrismaNotFoundError, isPrismaUniqueConstrantError } from 'src/shared/helpers';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository';
import { EmailService } from 'src/shared/services/email.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { CreateAccessTokenPayload } from 'src/shared/types/jwt.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async register({ email, password, name, phoneNumber, code }: RegisterBodyType) {
    try {
      await this.validateVerificationCode({ email, code, type: TypeOfVerificationCode.REGISTER });

      const clientRoleId = await this.roleService.getClientRoleId();

      const hashedPassword = await this.hashingService.hash(password);

      const [user] = await Promise.all([
        this.authRepository.createUser({
          email,
          password: hashedPassword,
          name,
          phoneNumber,
          roleId: clientRoleId,
          avatar: null,
        }),
        this.authRepository.deleteVerificationCode({
          email,
          code,
          type: TypeOfVerificationCode.REGISTER,
        }),
      ]);

      return user;
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
        throw EmailAlreadyExistsException;
      }
      throw error;
    }
  }

  async sendOTP({ email, type }: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({ email });

    if (user && type === TypeOfVerificationCode.REGISTER) {
      throw EmailAlreadyExistsException;
    }

    if (!user && type !== TypeOfVerificationCode.FORGOT_PASSWORD) {
      throw EmailNotFoundException;
    }

    const otpCode = generateOTPCode();

    await this.authRepository.createVerificationCode({
      email,
      code: otpCode,
      type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
    });

    const { error } = await this.emailService.sendOTP({
      email,
      code: otpCode,
    });

    if (error) {
      throw FailedToSendOTPException;
    }

    return {
      message: 'Send OTP code successfully',
    };
  }

  async login({ email, password, userAgent, ip }: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({ email });

    if (!user) {
      throw EmailNotFoundException;
    }

    const isPasswordMatch = await this.hashingService.compare(password, user.password);

    if (!isPasswordMatch) {
      throw InvalidPasswordException;
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      ip,
      userAgent,
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    return tokens;
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);

      const refreshTokenInDB = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({ token: refreshToken });

      if (!refreshTokenInDB) {
        throw RefreshTokenAlreadyUsedException;
      }

      const {
        deviceId,
        user: {
          role: { id: roleId, name: roleName },
        },
      } = refreshTokenInDB;

      const $updateDevice = this.authRepository.updateDevice(refreshTokenInDB.deviceId, {
        ip,
        userAgent,
      });

      const $deleteToken = this.authRepository.deleteRefreshToken(refreshToken);

      const $tokens = this.generateTokens({
        userId,
        deviceId,
        roleId,
        roleName,
      });

      const [, , tokens] = await Promise.all([$updateDevice, $deleteToken, $tokens]);

      return tokens;
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw UnauthorizedAccessException;
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.tokenService.verifyRefreshToken(refreshToken);

      const { deviceId } = await this.authRepository.deleteRefreshToken(refreshToken);

      await this.authRepository.updateDevice(deviceId, {
        isActive: false,
      });

      return {
        message: 'Logout successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async forgotPassword({ email, code, newPassword }: ForgotPasswordBodyType) {
    const user = await this.sharedUserRepository.findUnique({ email });

    if (!user) {
      throw EmailNotFoundException;
    }

    await this.validateVerificationCode({ email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD });

    const hashedPassword = await this.hashingService.hash(newPassword);

    await Promise.all([
      this.authRepository.updateUser(
        { id: user.id },
        {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      ),
      this.authRepository.deleteVerificationCode({
        email,
        code,
        type: TypeOfVerificationCode.FORGOT_PASSWORD,
      }),
    ]);

    return {
      message: 'Change password successfully',
    };
  }

  async generateTokens(payload: CreateAccessTokenPayload) {
    const { userId, deviceId } = payload;

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ]);

    const decodedToken = await this.tokenService.verifyRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedToken.exp * 1000),
      deviceId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateVerificationCode({
    code,
    email,
    type,
  }: {
    email: string;
    code: string;
    type: TypeOfVerificationCodeType;
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email,
      code,
      type,
    });

    if (!verificationCode) {
      throw InvalidOTPException;
    }

    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException;
    }

    return verificationCode;
  }
}
