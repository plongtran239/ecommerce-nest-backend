import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import { ManageProductService } from 'src/routes/product/manage-product.service';
import {
  CreateProductBodyDTO,
  GetManageProductsQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from 'src/routes/product/product.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('manage-product/products')
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}

  @Get()
  @ApiBearerAuth()
  @ZodSerializerDto(GetProductsResDTO)
  async list(
    @Query() query: GetManageProductsQueryDTO,
    @User('userId') userId: number,
    @User('roleName') roleName: string,
  ) {
    return this.manageProductService.list({ query, userIdRequest: userId, roleNameRequest: roleName });
  }

  @Get(':productId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'The ID of the product',
  })
  @ZodSerializerDto(GetProductDetailResDTO)
  async findById(
    @Param() params: GetProductParamsDTO,
    @User('userId') userId: number,
    @User('roleName') roleName: string,
  ) {
    return this.manageProductService.getDetail({
      productId: params.productId,
      userIdRequest: userId,
      roleNameRequest: roleName,
    });
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(GetProductDetailResDTO)
  async create(@Body() body: CreateProductBodyDTO, @User('userId') userId: number) {
    return this.manageProductService.create({ data: body, createdById: userId });
  }

  @Put(':productId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'The ID of the product',
  })
  @ZodSerializerDto(ProductDTO)
  async update(
    @Param() params: GetProductParamsDTO,
    @Body() body: UpdateProductBodyDTO,
    @User('userId') userId: number,
    @User('roleName') roleName: string,
  ) {
    return this.manageProductService.update({
      id: params.productId,
      data: body,
      updatedById: userId,
      roleNameRequest: roleName,
    });
  }

  @Delete(':productId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'The ID of the product',
  })
  @ZodSerializerDto(MessageResDTO)
  async delete(
    @Param() params: GetProductParamsDTO,
    @User('userId') userId: number,
    @User('roleName') roleName: string,
  ) {
    return this.manageProductService.delete({ id: params.productId, deletedById: userId, roleNameRequest: roleName });
  }
}
