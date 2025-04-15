import { Module } from '@nestjs/common';

import { ProductController } from 'src/routes/product/product.controller';
import { ProductRepository } from 'src/routes/product/product.repository';
import { ProductService } from 'src/routes/product/product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class ProductModule {}
