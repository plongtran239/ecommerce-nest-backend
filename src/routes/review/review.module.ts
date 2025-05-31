import { ReviewController } from './review.controller';
import { Module } from '@nestjs/common';

import { ReviewRepository } from 'src/routes/review/review.repository';
import { ReviewService } from 'src/routes/review/review.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
