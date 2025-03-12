import { createZodDto } from 'nestjs-zod';

import {
  CreateLanguageBodySchema,
  CreateLanguageResSchema,
  GetDetailLanguageResSchema,
  GetLanguageParamsSchema,
  GetLanguagesResSchema,
  UpdateLanguageBodySchema,
  UpdateLanguageResSchema,
} from 'src/routes/language/language.model';

export class CreateLanguageBodyDTO extends createZodDto(CreateLanguageBodySchema) {}

export class CreateLanguageResDTO extends createZodDto(CreateLanguageResSchema) {}

export class GetLanguageParamsDTO extends createZodDto(GetLanguageParamsSchema) {}

export class GetLanguagesResDTO extends createZodDto(GetLanguagesResSchema) {}

export class GetDetailLanguageResDTO extends createZodDto(GetDetailLanguageResSchema) {}

export class UpdateLanguageBodyDTO extends createZodDto(UpdateLanguageBodySchema) {}

export class UpdateLanguageResDTO extends createZodDto(UpdateLanguageResSchema) {}
