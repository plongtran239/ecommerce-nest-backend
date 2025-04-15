import { Injectable } from '@nestjs/common';

import {
  CategoryTranslationAlreadyExistsException,
  LanguageNotFoundException,
} from 'src/routes/category/category-translation/category-translation.error';
import {
  CreateCategoryTranslationBodyType,
  UpdateCategoryTranslationBodyType,
} from 'src/routes/category/category-translation/category-translation.model';
import { CategoryTranslationRepository } from 'src/routes/category/category-translation/category-translation.repository';
import { NotFoundRecordException } from 'src/shared/error';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
} from 'src/shared/helpers';

@Injectable()
export class CategoryTranslationService {
  constructor(private categoryTranslationRepository: CategoryTranslationRepository) {}

  async findById(id: number) {
    const category = await this.categoryTranslationRepository.findById(id);
    if (!category) {
      throw NotFoundRecordException;
    }
    return category;
  }

  async create({ data, createdById }: { data: CreateCategoryTranslationBodyType; createdById: number }) {
    try {
      return await this.categoryTranslationRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw CategoryTranslationAlreadyExistsException;
      }
      if (isPrismaForeignKeyConstraintError(error)) {
        throw LanguageNotFoundException;
      }
      throw error;
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number;
    data: UpdateCategoryTranslationBodyType;
    updatedById: number;
  }) {
    try {
      const category = await this.categoryTranslationRepository.update({
        id,
        updatedById,
        data,
      });
      return category;
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw CategoryTranslationAlreadyExistsException;
      }
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isPrismaForeignKeyConstraintError(error)) {
        throw LanguageNotFoundException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.categoryTranslationRepository.delete({
        id,
        deletedById,
      });
      return {
        message: 'Delete category translation successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
