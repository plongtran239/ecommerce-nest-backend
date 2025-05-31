import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateReviewBodyDTO,
  GetReviewDetailParamsDTO,
  GetReviewsDTO,
  GetReviewsParamsDTO,
  UpdateReviewBodyDTO,
} from 'src/routes/review/review.dto';
import { ReviewService } from 'src/routes/review/review.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { PaginationQueryDTO } from 'src/shared/dtos/pagination.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/products/:productId')
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'The ID of the product',
  })
  @IsPublic()
  @ZodSerializerDto(GetReviewsDTO)
  async getReviews(@Param() params: GetReviewsParamsDTO, @Query() query: PaginationQueryDTO) {
    return this.reviewService.getReviews({ productId: params.productId, page: query.page, limit: query.limit });
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(CreateReviewBodyDTO)
  async createReview(@Body() body: CreateReviewBodyDTO, @User('userId') userId: number) {
    return this.reviewService.create({ data: body, userId });
  }

  @Put(':reviewId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'reviewId',
    type: Number,
    description: 'The ID of the review',
  })
  @ZodSerializerDto(UpdateReviewBodyDTO)
  async updateReview(
    @Param() params: GetReviewDetailParamsDTO,
    @Body() body: UpdateReviewBodyDTO,
    @User('userId') userId: number,
  ) {
    return this.reviewService.updateReview({ reviewId: params.reviewId, data: body, userId });
  }
}
