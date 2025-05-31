import { Injectable } from '@nestjs/common';

import {
  CannotUpdateReviewError,
  InvalidOrderError,
  InvalidProductError,
  InvalidReviewError,
  OrderNotDeliveredError,
  ReviewAlreadyExistsError,
} from 'src/routes/review/review.error';
import { CreateReviewBodyType, GetReviewsParamsType, UpdateReviewBodyType } from 'src/routes/review/review.model';
import { ReviewRepository } from 'src/routes/review/review.repository';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { isPrismaUniqueConstraintError } from 'src/shared/helpers';
import { PaginationQueryType } from 'src/shared/models/pagination.model';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getReviews({ productId, page, limit }: GetReviewsParamsType & PaginationQueryType) {
    return this.reviewRepository.list({ productId, page, limit });
  }

  async create({ data, userId }: { data: CreateReviewBodyType; userId: number }) {
    try {
      await this.validateOrder({
        orderId: data.orderId,
        productId: data.productId,
        userId,
      });

      return await this.reviewRepository.create({ data, userId });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw ReviewAlreadyExistsError;
      }

      throw error;
    }
  }

  async updateReview({ reviewId, data, userId }: { reviewId: number; data: UpdateReviewBodyType; userId: number }) {
    await Promise.all([
      this.validateOrder({
        orderId: data.orderId,
        productId: data.productId,
        userId,
      }),
      this.validateReview({ reviewId, userId }),
    ]);

    return this.reviewRepository.update({ reviewId, data, userId });
  }

  private async validateOrder({ orderId, userId, productId }: { orderId: number; userId: number; productId: number }) {
    const order = await this.reviewRepository.findOrderByIdAndUserId({ orderId, userId });

    if (!order) {
      throw InvalidOrderError;
    }

    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw OrderNotDeliveredError;
    }

    if (!order.products.some((product) => product.id === productId)) {
      throw InvalidProductError;
    }
  }

  private async validateReview({ reviewId, userId }: { reviewId: number; userId: number }) {
    const review = await this.reviewRepository.findReviewByIdAndUserId({ reviewId, userId });

    if (!review) {
      throw InvalidReviewError;
    }

    if (review.updateCount >= 1) {
      throw CannotUpdateReviewError;
    }
  }
}
