import { Injectable } from '@nestjs/common';

import { RegisterBodyType, VerificationCodeType } from 'src/routes/auth/auth.model';
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';
import { UserType } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async findRoleByName(name: string) {
    return this.prismaService.role.findUniqueOrThrow({
      where: {
        name,
      },
    });
  }

  async createVerificationCode(data: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>) {
    return this.prismaService.verificationCode.upsert({
      where: {
        email: data.email,
      },
      create: data,
      update: {
        code: data.code,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findUniqueVerificationCode(
    uniqueObject:
      | { id: number }
      | { email: string }
      | {
          email: string;
          code: string;
          type: TypeOfVerificationCodeType;
        },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: uniqueObject,
    });
  }
}
