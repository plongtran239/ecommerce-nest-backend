import { HttpException, Injectable } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';

import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidTOTPAndCodeException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnabledException,
  TOTPNotEnabledException,
  UnauthorizedAccessException,
} from 'src/routes/auth/auth.error';
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';
import { InvalidPasswordException } from 'src/shared/error';
import { generateOTPCode, isPrismaNotFoundError, isPrismaUniqueConstrantError } from 'src/shared/helpers';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repository';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository';
import { TwoFactorAuthService } from 'src/shared/services/2fa.service';
import { EmailService } from 'src/shared/services/email.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { CreateAccessTokenPayload } from 'src/shared/types/jwt.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async register({ email, password, name, phoneNumber, code }: RegisterBodyType) {
    try {
      await this.validateVerificationCode({ email, code, type: TypeOfVerificationCode.REGISTER });

      const clientRoleId = await this.sharedRoleRepository.getClientRoleId();

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
          email_code_type: {
            email,
            code,
            type: TypeOfVerificationCode.REGISTER,
          },
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

    if (!user && type === TypeOfVerificationCode.FORGOT_PASSWORD) {
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

  async login({ email, password, userAgent, ip, code, totpCode }: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({ email });

    if (!user) {
      throw EmailNotFoundException;
    }

    const isPasswordMatch = await this.hashingService.compare(password, user.password);

    if (!isPasswordMatch) {
      throw InvalidPasswordException;
    }

    if (user.totpSecret) {
      if (!code && !totpCode) {
        throw InvalidTOTPAndCodeException;
      }

      if (totpCode) {
        const isTOTPValid = this.twoFactorAuthService.verifyTOTP({
          email: user.email,
          token: totpCode,
          secret: user.totpSecret,
        });

        if (!isTOTPValid) {
          throw InvalidTOTPAndCodeException;
        }
      } else if (code) {
        await this.validateVerificationCode({ email, code, type: TypeOfVerificationCode.LOGIN });
      }
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
      this.sharedUserRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
          updatedAt: new Date(),
          updatedById: user.id,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email,
          code,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ]);

    return {
      message: 'Reset password successfully',
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

  async setupTwoFactorAuth(userId: number) {
    const user = await this.sharedUserRepository.findUnique({ id: userId });

    if (!user) {
      throw EmailNotFoundException;
    }

    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException;
    }

    const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(user.email);

    await this.sharedUserRepository.update(
      {
        id: userId,
      },
      {
        totpSecret: secret,
        updatedById: userId,
      },
    );

    return {
      secret,
      uri,
    };
  }

  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { code, totpCode, userId } = data;

    const user = await this.sharedUserRepository.findUnique({ id: userId });

    if (!user) {
      throw EmailNotFoundException;
    }

    if (!user.totpSecret) {
      throw TOTPNotEnabledException;
    }

    if (totpCode) {
      const isTOTPValid = this.twoFactorAuthService.verifyTOTP({
        email: user.email,
        token: totpCode,
        secret: user.totpSecret,
      });

      if (!isTOTPValid) {
        throw InvalidTOTPAndCodeException;
      }
    } else if (code) {
      await this.validateVerificationCode({ email: user.email, code, type: TypeOfVerificationCode.DISABLE_2FA });
    }

    await this.sharedUserRepository.update(
      {
        id: userId,
      },
      {
        totpSecret: null,
        updatedById: userId,
      },
    );

    return {
      message: 'Disable 2FA successfully',
    };
  }

  private async validateVerificationCode({
    code,
    email,
    type,
  }: {
    email: string;
    code: string;
    type: TypeOfVerificationCodeType;
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_code_type: {
        email,
        code,
        type,
      },
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
