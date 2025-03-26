import { createZodDto } from 'nestjs-zod';

import { GetUserProfileResSchema, UpdateUserProfileResSchema } from 'src/shared/models/shared-user.model';

export class GetUserProfileResDTO extends createZodDto(GetUserProfileResSchema) {}

export class UpdateUserProfileResDTO extends createZodDto(UpdateUserProfileResSchema) {}
