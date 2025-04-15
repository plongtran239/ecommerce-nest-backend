import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateProductBodyDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from 'src/routes/product/product.dto';
import { ProductService } from 'src/routes/product/product.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

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
  async findById(@Param() params: GetProductParamsDTO) {
    return this.productService.findById(params.productId);
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  async create(@Body() body: CreateProductBodyDTO, @User('userId') userId: number) {
    return this.productService.create({ data: body, createdById: userId });
  }

  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  async update(
    @Param() params: GetProductParamsDTO,
    @Body() body: UpdateProductBodyDTO,
    @User('userId') userId: number,
  ) {
    return this.productService.update({ id: params.productId, data: body, updatedById: userId });
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDTO)
  async delete(@Param() params: GetProductParamsDTO, @User('userId') userId: number) {
    return this.productService.delete({ id: params.productId, deletedById: userId });
  }
}
