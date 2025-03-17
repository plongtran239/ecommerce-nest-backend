import { Injectable } from '@nestjs/common';

import { RoleType } from 'src/shared/models/shared-role.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByName(name: string): Promise<RoleType[]> {
    return this.prismaService.$queryRaw`
      SELECT * FROM "Role" 
      WHERE name = ${name} 
      AND "deletedAt" IS NULL
      LIMIT 1
    `;
  }
}
