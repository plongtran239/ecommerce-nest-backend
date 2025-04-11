import { z } from 'zod';

import { CategoryTranslationSchema } from 'src/routes/category/category-translation/category-translation.model';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().url().max(1000).nullable(),
  parentCategoryId: z.number().nullable(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CategoryIncludeTranslationSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
});

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

export type CategoryType = z.infer<typeof CategorySchema>;
export type CategoryIncludeTranslationType = z.infer<typeof CategoryIncludeTranslationSchema>;
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>;
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>;
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>;
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
