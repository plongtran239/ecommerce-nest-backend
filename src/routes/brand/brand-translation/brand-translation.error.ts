import { UnprocessableEntityException } from '@nestjs/common';

export const BrandTranslationAlreadyExistsException = new UnprocessableEntityException([
  {
    path: 'languageId',
    message: 'Error.BrandTranslationAlreadyExists',
  },
]);

export const LanguageNotFoundException = new UnprocessableEntityException([
  {
    path: 'languageId',
    message: 'Error.LanguageNotFound',
  },
]);
