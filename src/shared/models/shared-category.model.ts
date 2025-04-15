import { z } from 'zod';

import { CategoryTranslationSchema } from 'src/shared/models/shared-category-translation.model';

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

export type CategoryType = z.infer<typeof CategorySchema>;
export type CategoryIncludeTranslationType = z.infer<typeof CategoryIncludeTranslationSchema>;
