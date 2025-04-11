import { Module } from '@nestjs/common';

import { CategoryController } from 'src/routes/category/category.controller';
import { CategoryRepository } from 'src/routes/category/category.repository';
import { CategoryService } from 'src/routes/category/category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
