import { z } from 'zod';

import { BrandTranslationSchema } from 'src/routes/brand/brand-translation/brand-translation.model';
import { PaginationSchema } from 'src/shared/models/pagination.model';

export const BrandSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  logo: z.string().url().max(1000),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const BrandIncludeTranslationSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema),
});

export const GetBrandsResSchema = PaginationSchema.extend({
  data: z.array(BrandIncludeTranslationSchema),
  totalItems: z.coerce.number().int(),
});

export const GetBrandParamsSchema = z
  .object({
    brandId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetBrandDetailResSchema = BrandIncludeTranslationSchema;

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  logo: true,
}).strict();

export const UpdateBrandBodySchema = CreateBrandBodySchema;

export type BrandType = z.infer<typeof BrandSchema>;
export type BrandIncludeTranslationType = z.infer<typeof BrandIncludeTranslationSchema>;
export type GetBrandsResType = z.infer<typeof GetBrandsResSchema>;
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>;
export type GetBrandDetailResType = z.infer<typeof GetBrandDetailResSchema>;
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>;
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>;
