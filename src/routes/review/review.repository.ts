import { Injectable } from '@nestjs/common';

import {
  CreateReviewBodyType,
  CreateReviewResType,
  GetReviewsParamsType,
  GetReviewsType,
  ReviewType,
  UpdateReviewBodyType,
} from 'src/routes/review/review.model';
import { PaginationQueryType } from 'src/shared/models/pagination.model';
import { OrderType } from 'src/shared/models/shared-order.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list({ productId, page, limit }: GetReviewsParamsType & PaginationQueryType): Promise<GetReviewsType> {
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalItems, data] = await Promise.all([
      this.prisma.review.count({
        where: {
          productId,
        },
      }),
      this.prisma.review.findMany({
        where: {
          productId,
        },
        include: {
          medias: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      totalItems,
      data,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async create({ data, userId }: { data: CreateReviewBodyType; userId: number }): Promise<CreateReviewResType> {
    const { orderId, productId, content, rating, medias } = data;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          orderId,
          productId,
          content,
          rating,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      const reviewMedias = await tx.reviewMedia.createManyAndReturn({
        data: medias.map((media) => ({
          reviewId: review.id,
          url: media.url,
          type: media.type,
        })),
      });

      return {
        ...review,
        medias: reviewMedias,
      };
    });
  }

  async update({ reviewId, data, userId }: { reviewId: number; data: UpdateReviewBodyType; userId: number }) {
    const { orderId, productId, content, rating, medias } = data;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: {
          id: reviewId,
          userId,
        },
        data: {
          orderId,
          productId,
          content,
          rating,
          updateCount: {
            increment: 1,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      await tx.reviewMedia.deleteMany({
        where: {
          reviewId,
        },
      });

      const reviewMedias = await tx.reviewMedia.createManyAndReturn({
        data: medias.map((media) => ({
          reviewId: review.id,
          url: media.url,
          type: media.type,
        })),
      });

      return {
        ...review,
        medias: reviewMedias,
      };
    });
  }

  async findOrderByIdAndUserId({
    orderId,
    userId,
  }: {
    orderId: number;
    userId: number;
  }): Promise<(OrderType & { products: { id: number }[] }) | null> {
    return this.prisma.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findReviewByIdAndUserId({
    reviewId,
    userId,
  }: {
    reviewId: number;
    userId: number;
  }): Promise<ReviewType | null> {
    return this.prisma.review.findUnique({
      where: {
        id: reviewId,
        userId,
      },
    });
  }
}
