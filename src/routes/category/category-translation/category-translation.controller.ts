import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateCategoryTranslationBodyDTO,
  GetCategoryTranslationDetailResDTO,
  GetCategoryTranslationParamsDTO,
  UpdateCategoryTranslationBodyDTO,
} from 'src/routes/category/category-translation/category-translation.dto';
import { CategoryTranslationService } from 'src/routes/category/category-translation/category-translation.service';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('category-translations')
export class CategoryTranslationController {
  constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

  @Get(':categoryTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'categoryTranslationId',
    type: Number,
    description: 'The ID of the category translation',
  })
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.findById(params.categoryTranslationId);
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  create(@Body() body: CreateCategoryTranslationBodyDTO, @User('userId') userId: number) {
    return this.categoryTranslationService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':categoryTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'categoryTranslationId',
    type: Number,
    description: 'The ID of the category translation',
  })
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  update(
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @Param() params: GetCategoryTranslationParamsDTO,
    @User('userId') userId: number,
  ) {
    return this.categoryTranslationService.update({
      data: body,
      id: params.categoryTranslationId,
      updatedById: userId,
    });
  }

  @Delete(':categoryTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'categoryTranslationId',
    type: Number,
    description: 'The ID of the category translation',
  })
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetCategoryTranslationParamsDTO, @User('userId') userId: number) {
    return this.categoryTranslationService.delete({
      id: params.categoryTranslationId,
      deletedById: userId,
    });
  }
}
