import { z } from 'zod';

import { CategoryTranslationSchema } from 'src/shared/models/shared-category-translation.model';

export const GetCategoryTranslationParamsSchema = z
  .object({
    categoryTranslationId: z.coerce.number().int().positive(),
  })
  .strict();

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  categoryId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateCategoryTranslationBodySchema = CreateCategoryTranslationBodySchema;

export type CreateCategoryTranslationBodyType = z.infer<typeof CreateCategoryTranslationBodySchema>;
export type UpdateCategoryTranslationBodyType = z.infer<typeof UpdateCategoryTranslationBodySchema>;
export type GetCategoryTranslationParamsType = z.infer<typeof GetCategoryTranslationParamsSchema>;
