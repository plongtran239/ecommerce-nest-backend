import { z } from 'zod';

export const LanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const CreateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
}).strict();

export const CreateLanguageResSchema = LanguageSchema;

export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string().max(10),
  })
  .strict();

export const GetLanguagesResSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number().int(),
});

export const GetDetailLanguageResSchema = LanguageSchema;

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  name: true,
}).strict();

export const UpdateLanguageResSchema = LanguageSchema;

export type LanguageType = z.infer<typeof LanguageSchema>;
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>;
export type CreateLanguageResType = z.infer<typeof CreateLanguageResSchema>;
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>;
export type GetLanguagesResType = z.infer<typeof GetLanguagesResSchema>;
export type GetDetailLanguageResType = z.infer<typeof GetDetailLanguageResSchema>;
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>;
export type UpdateLanguageResType = z.infer<typeof UpdateLanguageResSchema>;
