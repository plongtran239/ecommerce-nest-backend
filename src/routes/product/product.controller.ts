import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
} from 'src/routes/product/product.dto';
import { ProductService } from 'src/routes/product/product.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@SkipThrottle()
@IsPublic()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  async list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list(query);
  }

  @Get(':productId')
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'The ID of the product',
  })
  @ZodSerializerDto(GetProductDetailResDTO)
  async getDetail(@Param() params: GetProductParamsDTO) {
    return this.productService.getDetail(params.productId);
  }
}
