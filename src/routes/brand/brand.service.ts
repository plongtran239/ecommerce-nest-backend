import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import { CreateBrandBodyType, UpdateBrandBodyType } from 'src/routes/brand/brand.model';
import { BrandRepository } from 'src/routes/brand/brand.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError } from 'src/shared/helpers';
import { PaginationQueryType } from 'src/shared/models/pagination.model';

@Injectable()
export class BrandService {
  constructor(private brandRepository: BrandRepository) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.brandRepository.list(pagination, I18nContext.current()?.lang as string);
    return data;
  }

  async findById(id: number) {
    const brand = await this.brandRepository.findById(id, I18nContext.current()?.lang as string);
    if (!brand) {
      throw NotFoundRecordException;
    }
    return brand;
  }

  create({ data, createdById }: { data: CreateBrandBodyType; createdById: number }) {
    return this.brandRepository.create({
      createdById,
      data,
    });
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateBrandBodyType; updatedById: number }) {
    try {
      const brand = await this.brandRepository.update({
        id,
        updatedById,
        data,
      });
      return brand;
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.brandRepository.delete({
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
