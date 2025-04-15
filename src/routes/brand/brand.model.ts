import { z } from 'zod';

import { PaginationSchema } from 'src/shared/models/pagination.model';
import { BrandIncludeTranslationSchema, BrandSchema } from 'src/shared/models/shared-brand.model';

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

export type GetBrandsResType = z.infer<typeof GetBrandsResSchema>;
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>;
export type GetBrandDetailResType = z.infer<typeof GetBrandDetailResSchema>;
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>;
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>;
