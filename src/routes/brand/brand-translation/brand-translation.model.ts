import { z } from 'zod';

import { BrandTranslationSchema } from 'src/shared/models/shared-brand-translation.model';

export const GetBrandTranslationParamsSchema = z
  .object({
    brandTranslationId: z.coerce.number().int().positive(),
  })
  .strict();

export const CreateBrandTranslationBodySchema = BrandTranslationSchema.pick({
  brandId: true,
  languageId: true,
  name: true,
  description: true,
}).strict();

export const UpdateBrandTranslationBodySchema = CreateBrandTranslationBodySchema;

export type CreateBrandTranslationBodyType = z.infer<typeof CreateBrandTranslationBodySchema>;
export type UpdateBrandTranslationBodyType = z.infer<typeof UpdateBrandTranslationBodySchema>;
export type GetBrandTranslationParamsType = z.infer<typeof GetBrandTranslationParamsSchema>;
