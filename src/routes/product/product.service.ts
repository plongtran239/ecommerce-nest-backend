import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import { CreateProductBodyType, GetProductsQueryType, UpdateProductBodyType } from 'src/routes/product/product.model';
import { ProductRepository } from 'src/routes/product/product.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError } from 'src/shared/helpers';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async list(query: GetProductsQueryType) {
    const data = await this.productRepository.list(query, I18nContext.current()?.lang as string);
    return data;
  }

  async findById(id: number) {
    const product = await this.productRepository.findById(id, I18nContext.current()?.lang as string);
    if (!product) {
      throw NotFoundRecordException;
    }
    return product;
  }

  async create(payload: { data: CreateProductBodyType; createdById: number }) {
    return await this.productRepository.create(payload);
  }

  async update(payload: { id: number; data: UpdateProductBodyType; updatedById: number }) {
    try {
      return await this.productRepository.update(payload);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete(payload: { id: number; deletedById: number }) {
    try {
      await this.productRepository.delete(payload);

      return {
        message: 'Delete product successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
