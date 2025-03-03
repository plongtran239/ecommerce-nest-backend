import { HttpException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';

import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { RoleService } from 'src/routes/auth/role.service';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
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
      const clientRoleId = await this.roleService.getClientRoleId();

      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email,
        code,
        type: TypeOfVerificationCode.REGISTER,
      });

      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Invalid OTP code',
            path: 'code',
          },
        ]);
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'OTP code has expired',
            path: 'code',
          },
        ]);
      }

      const hashedPassword = await this.hashingService.hash(password);

      return await this.authRepository.createUser({
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        roleId: clientRoleId,
        avatar: null,
      });
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email already exists',
            path: 'email',
          },
        ]);
      }
      throw error;
    }
  }

  async sendOTP({ email, type }: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({ email });

    if (user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email already exists',
          path: 'email',
        },
      ]);
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
      throw new UnprocessableEntityException([
        {
          message: 'Failed to send OTP code',
          path: 'code',
        },
      ]);
    }

    return {
      message: 'Send OTP code successfully',
    };
  }

  async login({ email, password, userAgent, ip }: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({ email });

    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email not exists',
          path: 'email',
        },
      ]);
    }

    const isPasswordMatch = await this.hashingService.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([
        {
          message: 'Invalid password',
          path: 'password',
        },
      ]);
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
        throw new UnauthorizedException('Invalid refresh token');
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
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw error;
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
        throw new UnauthorizedException('Invalid refresh token');
      }

      throw error;
    }
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
}
