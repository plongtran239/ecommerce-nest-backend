import { Injectable } from '@nestjs/common';

import { LanguageAlreadyExistsException } from 'src/routes/language/language.error';
import { CreateLanguageBodyType, UpdateLanguageBodyType } from 'src/routes/language/language.model';
import { LanguageRepository } from 'src/routes/language/language.repository';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError, isPrismaUniqueConstrantError } from 'src/shared/helpers';

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async create(payload: { data: CreateLanguageBodyType; createdById: number }) {
    try {
      return await this.languageRepository.create(payload);
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
        throw LanguageAlreadyExistsException;
      }
      throw error;
    }
  }

  async getAll() {
    const languages = await this.languageRepository.findAll();

    return {
      data: languages,
      totalItems: languages.length,
    };
  }

  async getById(id: string) {
    const language = await this.languageRepository.findById(id);

    if (!language) {
      throw NotFoundRecordException;
    }

    return language;
  }

  async update(payload: { id: string; data: UpdateLanguageBodyType; updatedById: number }) {
    try {
      return await this.languageRepository.update(payload);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      if (isPrismaUniqueConstrantError(error)) {
        throw LanguageAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete(payload: { id: string; deletedById: number }) {
    try {
      await this.languageRepository.delete(payload, true);

      return {
        message: 'Delete language successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
