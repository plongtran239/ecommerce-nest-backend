import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';

import { LoginBodyType, RegisterBodyType, SendOTPBodyType } from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { RoleService } from 'src/routes/auth/role.service';
import envConfig from 'src/shared/config';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import { generateOTPCode, isPrismaUniqueConstrantError } from 'src/shared/helpers';
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

  async register(body: RegisterBodyType) {
    try {
      const { email, password, name, phoneNumber, code } = body;

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

  async sendOTP(body: SendOTPBodyType) {
    const { email } = body;

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

    const verificationCode = await this.authRepository.createVerificationCode({
      email,
      code: otpCode,
      type: body.type,
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

    return verificationCode;
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const { email, password, userAgent, ip } = body;

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
