import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import { CreateCategoryBodyType, UpdateCategoryBodyType } from 'src/routes/category/category.model';
import { CategoryRepository } from 'src/routes/category/category.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError } from 'src/shared/helpers';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async list(parentCategoryId: number | null) {
    const data = await this.categoryRepository.list(parentCategoryId, I18nContext.current()?.lang as string);
    return data;
  }

  async findById(id: number) {
    const category = await this.categoryRepository.findById(id, I18nContext.current()?.lang as string);
    if (!category) {
      throw NotFoundRecordException;
    }
    return category;
  }

  create({ data, createdById }: { data: CreateCategoryBodyType; createdById: number }) {
    return this.categoryRepository.create({
      createdById,
      data,
    });
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateCategoryBodyType; updatedById: number }) {
    try {
      const category = await this.categoryRepository.update({
        id,
        updatedById,
        data,
      });
      return category;
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.categoryRepository.delete({
        id,
        deletedById,
      });
      return {
        message: 'Delete successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
