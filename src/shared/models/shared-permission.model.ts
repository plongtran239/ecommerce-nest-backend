import { z } from 'zod';

import { HTTPMethod } from 'src/shared/constants/role.constant';

export const PermissionSchema = z.object({
  id: z.number().positive(),
  name: z.string().max(500),
  description: z.string(),
  path: z.string().max(1000),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  module: z.string().max(500),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type PermissionType = z.infer<typeof PermissionSchema>;
