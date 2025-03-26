import { Injectable } from '@nestjs/common';

import { ChangePasswordBodyType, UpdateUserProfileBodyType } from 'src/routes/profile/profile.model';
import { InvalidPasswordException, NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError } from 'src/shared/helpers';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly hashingServier: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async get(userId: number) {
    const user = await this.sharedUserRepository.findUniqueWithRolePermissions({
      id: userId,
      deletedAt: null,
    });

    if (!user) {
      throw NotFoundRecordException;
    }

    return user;
  }

  async update({ userId, data }: { userId: number; data: UpdateUserProfileBodyType }) {
    try {
      return await this.sharedUserRepository.update(
        {
          id: userId,
          deletedAt: null,
        },
        {
          ...data,
          updatedById: userId,
        },
      );
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async changePassword({ userId, data }: { userId: number; data: Omit<ChangePasswordBodyType, 'confirmPassword'> }) {
    const { newPassword, password } = data;

    try {
      const user = await this.sharedUserRepository.findUnique({
        id: userId,
        deletedAt: null,
      });

      if (!user) {
        throw NotFoundRecordException;
      }

      const isPasswordMatch = await this.hashingServier.compare(password, user.password);

      if (!isPasswordMatch) {
        throw InvalidPasswordException;
      }

      const hashedPassword = await this.hashingServier.hash(newPassword);

      await this.sharedUserRepository.update(
        {
          id: userId,
          deletedAt: null,
        },
        {
          password: hashedPassword,
          updatedById: userId,
        },
      );

      return {
        message: 'Change password successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        return NotFoundRecordException;
      }
      throw error;
    }
  }
}
