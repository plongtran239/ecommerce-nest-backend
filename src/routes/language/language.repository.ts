import { Injectable } from '@nestjs/common';

import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from 'src/routes/language/language.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create({ data, createdById }: { data: CreateLanguageBodyType; createdById: number }): Promise<LanguageType> {
    return this.prismaService.language.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  findAll(): Promise<LanguageType[]> {
    return this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  findById(id: string): Promise<LanguageType | null> {
    return this.prismaService.language.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdateLanguageBodyType;
    updatedById: number;
  }): Promise<LanguageType> {
    return this.prismaService.language.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  delete(id: string, isHard?: boolean): Promise<LanguageType> {
    if (isHard) {
      return this.prismaService.language.delete({
        where: {
          id,
        },
      });
    }

    return this.prismaService.language.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
