import { createZodDto } from 'nestjs-zod';

import {
  CreateBrandTranslationBodySchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from 'src/routes/brand/brand-translation/brand-translation.model';
import { BrandTranslationSchema } from 'src/shared/models/shared-brand-translation.model';

export class GetBrandTranslationDetailResDTO extends createZodDto(BrandTranslationSchema) {}

export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}

export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}

export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}
