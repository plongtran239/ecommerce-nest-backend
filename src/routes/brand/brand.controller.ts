import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateBrandBodyDTO,
  GetBrandDetailResDTO,
  GetBrandParamsDTO,
  GetBrandsResDTO,
  UpdateBrandBodyDTO,
} from 'src/routes/brand/brand.dto';
import { BrandService } from 'src/routes/brand/brand.service';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { PaginationQueryDTO } from 'src/shared/dtos/pagination.dto';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetBrandsResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.brandService.list(query);
  }

  @Get(':brandId')
  @IsPublic()
  @ApiParam({
    name: 'brandId',
    type: Number,
    description: 'The ID of the brand',
  })
  @ZodSerializerDto(GetBrandDetailResDTO)
  findById(@Param() params: GetBrandParamsDTO) {
    return this.brandService.findById(params.brandId);
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(GetBrandDetailResDTO)
  create(@Body() body: CreateBrandBodyDTO, @User('userId') userId: number) {
    return this.brandService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':brandId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'brandId',
    type: Number,
    description: 'The ID of the brand',
  })
  @ZodSerializerDto(GetBrandDetailResDTO)
  update(@Body() body: UpdateBrandBodyDTO, @Param() params: GetBrandParamsDTO, @User('userId') userId: number) {
    return this.brandService.update({
      data: body,
      id: params.brandId,
      updatedById: userId,
    });
  }

  @Delete(':brandId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'brandId',
    type: Number,
    description: 'The ID of the brand',
  })
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetBrandParamsDTO, @User('userId') userId: number) {
    return this.brandService.delete({
      id: params.brandId,
      deletedById: userId,
    });
  }
}
