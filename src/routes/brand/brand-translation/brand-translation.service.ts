import { Injectable } from '@nestjs/common';

import { BrandTranslationAlreadyExistsException } from 'src/routes/brand/brand-translation/brand-translation.error';
import {
  CreateBrandTranslationBodyType,
  UpdateBrandTranslationBodyType,
} from 'src/routes/brand/brand-translation/brand-translation.model';
import { BrandTranslationRepository } from 'src/routes/brand/brand-translation/brand-translation.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError, isPrismaUniqueConstrantError } from 'src/shared/helpers';

@Injectable()
export class BrandTranslationService {
  constructor(private brandTranslationRepository: BrandTranslationRepository) {}

  async findById(id: number) {
    const brand = await this.brandTranslationRepository.findById(id);
    if (!brand) {
      throw NotFoundRecordException;
    }
    return brand;
  }

  async create({ data, createdById }: { data: CreateBrandTranslationBodyType; createdById: number }) {
    try {
      return await this.brandTranslationRepository.create({
        createdById,
        data,
      });
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
        throw BrandTranslationAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateBrandTranslationBodyType; updatedById: number }) {
    try {
      const brand = await this.brandTranslationRepository.update({
        id,
        updatedById,
        data,
      });
      return brand;
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
        throw BrandTranslationAlreadyExistsException;
      }
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.brandTranslationRepository.delete({
        id,
        deletedById,
      });
      return {
        message: 'Delete brand translation successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
