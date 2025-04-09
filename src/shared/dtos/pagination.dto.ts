import { createZodDto } from 'nestjs-zod';

import { PaginationQuerySchema } from 'src/shared/models/pagination.model';

export class PaginationQueryDTO extends createZodDto(PaginationQuerySchema) {}
