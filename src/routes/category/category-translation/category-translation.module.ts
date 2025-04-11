import { Module } from '@nestjs/common';

import { CategoryTranslationController } from 'src/routes/category/category-translation/category-translation.controller';
import { CategoryTranslationRepository } from 'src/routes/category/category-translation/category-translation.repository';
import { CategoryTranslationService } from 'src/routes/category/category-translation/category-translation.service';

@Module({
  controllers: [CategoryTranslationController],
  providers: [CategoryTranslationService, CategoryTranslationRepository],
})
export class CategoryTranslationModule {}
