import { Injectable } from '@nestjs/common';

import {
  CannotCreateAdminUserException,
  CannotDeleteAdminUserException,
  CannotUpdateAdminUserException,
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException,
} from 'src/routes/user/user.error';
import { CreateUserBodyType, GetUsersQueryType } from 'src/routes/user/user.model';
import { UserRepository } from 'src/routes/user/user.repository';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaForeignKeyConstraintError, isPrismaUniqueConstraintError } from 'src/shared/helpers';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repository';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class UserService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly userRepository: UserRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) {}

  async list(query: GetUsersQueryType) {
    return await this.userRepository.list(query);
  }

  async getById(id: number) {
    const user = await this.sharedUserRepository.findUniqueWithRolePermissions({
      id,
    });

    if (!user) {
      throw NotFoundRecordException;
    }

    return user;
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType;
    createdById: number;
    createdByRoleName: string;
  }) {
    try {
      const isVerify = await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      });

      if (!isVerify) {
        throw CannotCreateAdminUserException;
      }

      const hashedPassword = await this.hashingService.hash(data.password);

      return await this.userRepository.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        createdById,
      });
    } catch (error) {
      if (isPrismaForeignKeyConstraintError(error)) {
        throw RoleNotFoundException;
      }

      if (isPrismaUniqueConstraintError(error)) {
        throw UserAlreadyExistsException;
      }

      throw error;
    }
  }

  async update({
    id,
    data,
    updatedById,
    updatedByRoleName,
  }: {
    id: number;
    data: CreateUserBodyType;
    updatedById: number;
    updatedByRoleName: string;
  }) {
    try {
      this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: id,
      });

      const roleIdTarget = await this.getRoleIdByUserId(id);

      const isVerify = await this.verifyRole({
        roleNameAgent: updatedByRoleName,
        roleIdTarget,
      });

      if (!isVerify) {
        throw CannotUpdateAdminUserException;
      }

      const hashedPassword = await this.hashingService.hash(data.password);

      return await this.sharedUserRepository.update(
        {
          id,
        },
        {
          ...data,
          password: hashedPassword,
          updatedById,
        },
      );
    } catch (error) {
      if (isPrismaForeignKeyConstraintError(error)) {
        throw RoleNotFoundException;
      }

      if (isPrismaUniqueConstraintError(error)) {
        throw UserAlreadyExistsException;
      }

      throw error;
    }
  }

  async delete({ id, deletedById, deletedByRoleName }: { id: number; deletedById: number; deletedByRoleName: string }) {
    this.verifyYourself({
      userAgentId: deletedById,
      userTargetId: id,
    });

    const roleIdTarget = await this.getRoleIdByUserId(id);

    const isVerify = await this.verifyRole({
      roleNameAgent: deletedByRoleName,
      roleIdTarget,
    });

    if (!isVerify) {
      throw CannotDeleteAdminUserException;
    }

    await this.userRepository.delete({
      id,
      deletedById,
    });

    return {
      message: 'Delete user successfully',
    };
  }

  private async verifyRole({ roleNameAgent, roleIdTarget }: { roleNameAgent: string; roleIdTarget: number }) {
    if (roleNameAgent === RoleName.Admin) {
      return true;
    } else {
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId();

      if (roleIdTarget === adminRoleId) {
        return false;
      }

      return true;
    }
  }

  private verifyYourself({ userAgentId, userTargetId }: { userAgentId: number; userTargetId: number }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException;
    }

    return true;
  }

  private async getRoleIdByUserId(userId: number) {
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
    });

    if (!user) {
      throw NotFoundRecordException;
    }

    return user.roleId;
  }
}
