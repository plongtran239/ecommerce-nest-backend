import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateCategoryBodyDTO,
  GetCategoriesQueryDTO,
  GetCategoriesResDTO,
  GetCategoryDetailResDTO,
  GetCategoryParamsDTO,
  UpdateCategoryBodyDTO,
} from 'src/routes/category/category.dto';
import { CategoryService } from 'src/routes/category/category.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetCategoriesResDTO)
  list(@Query() query: GetCategoriesQueryDTO) {
    return this.categoryService.list(query.parentCategoryId ?? null);
  }

  @Get(':categoryId')
  @IsPublic()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  findById(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.findById(params.categoryId);
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  create(@Body() body: CreateCategoryBodyDTO, @User('userId') userId: number) {
    return this.categoryService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':categoryId')
  @ApiBearerAuth()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  update(@Body() body: UpdateCategoryBodyDTO, @Param() params: GetCategoryParamsDTO, @User('userId') userId: number) {
    return this.categoryService.update({
      data: body,
      id: params.categoryId,
      updatedById: userId,
    });
  }

  @Delete(':categoryId')
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetCategoryParamsDTO, @User('userId') userId: number) {
    return this.categoryService.delete({
      id: params.categoryId,
      deletedById: userId,
    });
  }
}
