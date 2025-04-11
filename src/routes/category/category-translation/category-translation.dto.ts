import { createZodDto } from 'nestjs-zod';

import {
  CategoryTranslationSchema,
  CreateCategoryTranslationBodySchema,
  GetCategoryTranslationParamsSchema,
  UpdateCategoryTranslationBodySchema,
} from 'src/routes/category/category-translation/category-translation.model';

export class GetCategoryTranslationDetailResDTO extends createZodDto(CategoryTranslationSchema) {}

export class GetCategoryTranslationParamsDTO extends createZodDto(GetCategoryTranslationParamsSchema) {}

export class CreateCategoryTranslationBodyDTO extends createZodDto(CreateCategoryTranslationBodySchema) {}

export class UpdateCategoryTranslationBodyDTO extends createZodDto(UpdateCategoryTranslationBodySchema) {}
