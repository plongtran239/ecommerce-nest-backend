import { z } from 'zod';

import { CategoryIncludeTranslationSchema } from 'src/shared/models/shared-category.model';
import { CategorySchema } from 'src/shared/models/shared-category.model';

export const GetCategoriesQuerySchema = z.object({
  parentCategoryId: z.coerce.number().int().positive().optional(),
});

export const GetCategoriesResSchema = z.object({
  data: z.array(CategoryIncludeTranslationSchema),
  totalItems: z.coerce.number().int(),
});

export const GetCategoryParamsSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetCategoryDetailResSchema = CategoryIncludeTranslationSchema;

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict();

export const UpdateCategoryBodySchema = CreateCategoryBodySchema;

export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>;
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>;
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>;
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
