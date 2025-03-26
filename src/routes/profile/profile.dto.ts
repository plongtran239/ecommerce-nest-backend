import { createZodDto } from 'nestjs-zod';

import { ChangePasswordBodySchema, UpdateUserProfileBodySchema } from 'src/routes/profile/profile.model';

export class UpdateUserProfileBodyDTO extends createZodDto(UpdateUserProfileBodySchema) {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
