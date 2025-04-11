import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  totalPages: z.number().int(),
});

export const PaginationQuerySchema = PaginationSchema.pick({
  page: true,
  limit: true,
});

export type PaginationType = z.infer<typeof PaginationSchema>;
export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;
