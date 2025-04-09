import { Module } from '@nestjs/common';

import { BrandController } from 'src/routes/brand/brand.controller';
import { BrandRepository } from 'src/routes/brand/brand.repository';
import { BrandService } from 'src/routes/brand/brand.service';

@Module({
  controllers: [BrandController],
  providers: [BrandService, BrandRepository],
})
export class BrandModule {}
