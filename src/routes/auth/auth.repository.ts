import { Injectable } from '@nestjs/common';

import { DeviceType, RefreshTokenType, VerificationCodeType } from 'src/routes/auth/auth.model';
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';
import { RoleType } from 'src/shared/models/shared-role.model';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // Create
  async createUser(
    user: Pick<UserType, 'name' | 'email' | 'roleId' | 'password' | 'phoneNumber' | 'avatar'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createUserIncludeRole(
    user: Pick<UserType, 'name' | 'email' | 'roleId' | 'password' | 'phoneNumber'>,
  ): Promise<UserType & { role: RoleType }> {
    return this.prismaService.user.create({
      data: user,
      include: {
        role: true,
      },
    });
  }

  async createVerificationCode(data: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>) {
    return this.prismaService.verificationCode.upsert({
      where: {
        email_code_type: {
          email: data.email,
          code: data.code,
          type: data.type,
        },
      },
      create: data,
      update: {
        code: data.code,
        expiresAt: data.expiresAt,
      },
    });
  }

  async createRefreshToken(data: { token: string; userId: number; expiresAt: Date; deviceId: number }) {
    return this.prismaService.refreshToken.create({ data });
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'ip' | 'userAgent'> & Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return this.prismaService.device.create({ data });
  }

  // Find
  async findUniqueUserIncludeRole(
    uniqueObject: { id: number } | { email: string },
  ): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
      include: {
        role: true,
      },
    });
  }

  async findUniqueVerificationCode(
    uniqueObject:
      | { id: number }
      | {
          email_code_type: {
            email: string;
            code: string;
            type: TypeOfVerificationCodeType;
          };
        },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: uniqueObject,
    });
  }

  async findUniqueRefreshTokenIncludeUserRole(uniqueObject: {
    token: string;
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return this.prismaService.refreshToken.findUnique({
      where: uniqueObject,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  // Update
  async updateDevice(deviceId: number, data: Partial<DeviceType>) {
    return this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    });
  }

  async updateUser(
    uniqueObject: { id: number } | { email: string },
    data: Partial<Omit<UserType, 'id'>>,
  ): Promise<UserType> {
    return this.prismaService.user.update({
      where: uniqueObject,
      data,
    });
  }

  // Delete
  async deleteRefreshToken(token: string) {
    return this.prismaService.refreshToken.delete({
      where: {
        token,
      },
    });
  }

  async deleteVerificationCode(
    uniqueObject:
      | { id: number }
      | {
          email_code_type: {
            email: string;
            code: string;
            type: TypeOfVerificationCodeType;
          };
        },
  ) {
    return this.prismaService.verificationCode.delete({
      where: uniqueObject,
    });
  }
}
