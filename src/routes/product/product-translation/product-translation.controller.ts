import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateProductTranslationBodyDTO,
  GetProductTranslationDetailResDTO,
  GetProductTranslationParamsDTO,
  UpdateProductTranslationBodyDTO,
} from 'src/routes/product/product-translation/product-translation.dto';
import { ProductTranslationService } from 'src/routes/product/product-translation/product-translation.service';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('product-translations')
export class ProductTranslationController {
  constructor(private readonly productTranslationService: ProductTranslationService) {}

  @Get(':productTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'productTranslationId',
    type: Number,
    description: 'The ID of the product translation',
  })
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  findById(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.findById(params.productTranslationId);
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  create(@Body() body: CreateProductTranslationBodyDTO, @User('userId') userId: number) {
    return this.productTranslationService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':productTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'productTranslationId',
    type: Number,
    description: 'The ID of the product translation',
  })
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  update(
    @Body() body: UpdateProductTranslationBodyDTO,
    @Param() params: GetProductTranslationParamsDTO,
    @User('userId') userId: number,
  ) {
    return this.productTranslationService.update({
      data: body,
      id: params.productTranslationId,
      updatedById: userId,
    });
  }

  @Delete(':productTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'productTranslationId',
    type: Number,
    description: 'The ID of the product translation',
  })
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetProductTranslationParamsDTO, @User('userId') userId: number) {
    return this.productTranslationService.delete({
      id: params.productTranslationId,
      deletedById: userId,
    });
  }
}
