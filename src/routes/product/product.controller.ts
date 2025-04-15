import { Controller, Get, Param, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
} from 'src/routes/product/product.dto';
import { ProductService } from 'src/routes/product/product.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetProductsResDTO)
  async list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list(query);
  }

  @Get(':productId')
  @IsPublic()
  @ZodSerializerDto(GetProductDetailResDTO)
  async getDetail(@Param() params: GetProductParamsDTO) {
    return this.productService.getDetail(params.productId);
  }
}
