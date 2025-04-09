import { createZodDto } from 'nestjs-zod';

import {
  BrandTranslationSchema,
  CreateBrandTranslationBodySchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from 'src/routes/brand/brand-translation/brand-translation.model';

export class GetBrandTranslationDetailResDTO extends createZodDto(BrandTranslationSchema) {}

export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}

export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}

export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}
