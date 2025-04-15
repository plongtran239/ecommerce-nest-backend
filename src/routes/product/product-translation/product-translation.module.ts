import { Module } from '@nestjs/common';

import { ProductTranslationController } from 'src/routes/product/product-translation/product-translation.controller';
import { productTranslationRepository } from 'src/routes/product/product-translation/product-translation.repository';
import { ProductTranslationService } from 'src/routes/product/product-translation/product-translation.service';

@Module({
  controllers: [ProductTranslationController],
  providers: [ProductTranslationService, productTranslationRepository],
})
export class ProductTranslationModule {}
