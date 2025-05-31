import { BadRequestException, ConflictException } from '@nestjs/common';

export const InvalidOrderError = new BadRequestException('Order not exists or not belong to you');

export const InvalidProductError = new BadRequestException('Product not exists in order');

export const OrderNotDeliveredError = new BadRequestException('Order not delivered');

export const ReviewAlreadyExistsError = new ConflictException('Review for this order and product already exists');

export const InvalidReviewError = new BadRequestException('Review not exists or not belong to you');

export const CannotUpdateReviewError = new BadRequestException('You are only allowed to update your review once.');
