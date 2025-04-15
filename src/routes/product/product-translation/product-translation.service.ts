import { Injectable } from '@nestjs/common';

import { ProductTranslationAlreadyExistsException } from 'src/routes/product/product-translation/product-translation.error';
import {
  CreateProductTranslationBodyType,
  UpdateProductTranslationBodyType,
} from 'src/routes/product/product-translation/product-translation.model';
import { productTranslationRepository } from 'src/routes/product/product-translation/product-translation.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError, isPrismaUniqueConstraintError } from 'src/shared/helpers';

@Injectable()
export class ProductTranslationService {
  constructor(private productTranslationRepository: productTranslationRepository) {}

  async findById(id: number) {
    const product = await this.productTranslationRepository.findById(id);
    if (!product) {
      throw NotFoundRecordException;
    }
    return product;
  }

  async create({ data, createdById }: { data: CreateProductTranslationBodyType; createdById: number }) {
    try {
      return await this.productTranslationRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateProductTranslationBodyType; updatedById: number }) {
    try {
      const product = await this.productTranslationRepository.update({
        id,
        updatedById,
        data,
      });
      return product;
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw ProductTranslationAlreadyExistsException;
      }
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.productTranslationRepository.delete({
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
