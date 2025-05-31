import { z } from 'zod';

import { MediaType } from 'src/shared/constants/media.constant';
import { PaginationSchema } from 'src/shared/models/pagination.model';
import { UserSchema } from 'src/shared/models/shared-user.model';

export const ReviewMediaSchema = z.object({
  id: z.number().int().positive(),
  url: z.string().url(),
  type: z.enum([MediaType.IMAGE, MediaType.VIDEO]),
  reviewId: z.number().int().positive(),
  createdAt: z.date(),
});

export const ReviewSchema = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  userId: z.number().int().positive(),
  updateCount: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateReviewBodySchema = ReviewSchema.pick({
  content: true,
  rating: true,
  productId: true,
  orderId: true,
}).extend({
  medias: z.array(
    ReviewMediaSchema.pick({
      url: true,
      type: true,
    }),
  ),
});

export const CreateReviewResSchema = ReviewSchema.extend({
  medias: z.array(ReviewMediaSchema),
  user: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
});

export const UpdateReviewBodySchema = CreateReviewBodySchema;

export const UpdateReviewResSchema = CreateReviewResSchema;

export const GetReviewsSchema = PaginationSchema.extend({
  data: z.array(CreateReviewResSchema),
  totalItems: z.number().int(),
});

export const GetReviewsParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const GetReviewDetailParamsSchema = z.object({
  reviewId: z.coerce.number().int().positive(),
});

export type ReviewMediaType = z.infer<typeof ReviewMediaSchema>;
export type ReviewType = z.infer<typeof ReviewSchema>;
export type CreateReviewBodyType = z.infer<typeof CreateReviewBodySchema>;
export type CreateReviewResType = z.infer<typeof CreateReviewResSchema>;
export type UpdateReviewBodyType = z.infer<typeof UpdateReviewBodySchema>;
export type UpdateReviewResType = z.infer<typeof UpdateReviewResSchema>;
export type GetReviewsType = z.infer<typeof GetReviewsSchema>;
export type GetReviewsParamsType = z.infer<typeof GetReviewsParamsSchema>;
export type GetReviewDetailParamsType = z.infer<typeof GetReviewDetailParamsSchema>;
