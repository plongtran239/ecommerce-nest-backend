import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { keyBy } from 'lodash';

import { Cache } from 'cache-manager';
import { REQUEST_ROLE_PERMISSIONS_KEY, REQUEST_USER_KEY } from 'src/shared/constants/auth.constant';
import { HTTPMethod } from 'src/shared/constants/role.constant';
import { generateCacheKeyRole } from 'src/shared/helpers';
import { RoleWithPermissionsType } from 'src/shared/models/shared-role.model';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { AccessTokenPayload } from 'src/shared/types/jwt.type';

type Permission = RoleWithPermissionsType['permissions'][number];

type CachedRole = RoleWithPermissionsType & {
  permissions: {
    [key: string]: Permission;
  };
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (request.path === '/metrics') {
      return true;
    }

    const decodedAccessToken = await this.extractAndValidateAccessToken(request);

    await this.validateUserPermission(decodedAccessToken, request);

    return true;
  }

  private async extractAndValidateAccessToken(request: Request): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request);

    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken);

      request[REQUEST_USER_KEY] = decodedAccessToken;

      return decodedAccessToken;
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken');
    }
  }

  private extractAccessTokenFromHeader(request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Error.RequiredAccessToken');
    }

    return accessToken;
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: Request) {
    const roleId = decodedAccessToken.roleId;
    const path = request.route.path;
    const method = request.method as keyof typeof HTTPMethod;

    const cacheKey = generateCacheKeyRole(roleId);

    let cachedRole = await this.cacheManager.get<CachedRole>(cacheKey);

    if (cachedRole === null) {
      const role = await this.prismaService.role
        .findUniqueOrThrow({
          where: { id: roleId, deletedAt: null, isActive: true },
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        })
        .catch(() => {
          throw new ForbiddenException('Error.InvalidRole');
        });

      const permissionObject = keyBy(
        role.permissions,
        (permission) => `${permission.path}:${permission.method}`,
      ) as CachedRole['permissions'];

      cachedRole = {
        ...role,
        permissions: permissionObject,
      };

      await this.cacheManager.set(cacheKey, cachedRole, 1000 * 60 * 60); //cache for 1 hour

      request[REQUEST_ROLE_PERMISSIONS_KEY] = role;
    }

    const canAccess: Permission | undefined = cachedRole.permissions[`${path}:${method}`];

    if (!canAccess) {
      throw new ForbiddenException('Error.AccessDenied');
    }
  }
}
