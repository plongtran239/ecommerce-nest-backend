import { Module } from '@nestjs/common';

import { BrandTranslationController } from 'src/routes/brand/brand-translation/brand-translation.controller';
import { BrandTranslationRepository } from 'src/routes/brand/brand-translation/brand-translation.repository';
import { BrandTranslationService } from 'src/routes/brand/brand-translation/brand-translation.service';

@Module({
  controllers: [BrandTranslationController],
  providers: [BrandTranslationService, BrandTranslationRepository],
})
export class BrandTranslationModule {}
