import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateBrandTranslationBodyDTO,
  GetBrandTranslationDetailResDTO,
  GetBrandTranslationParamsDTO,
  UpdateBrandTranslationBodyDTO,
} from 'src/routes/brand/brand-translation/brand-translation.dto';
import { BrandTranslationService } from 'src/routes/brand/brand-translation/brand-translation.service';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('brand-translations')
export class BrandTranslationController {
  constructor(private readonly brandTranslationService: BrandTranslationService) {}

  @Get(':brandTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'brandTranslationId',
    type: Number,
    description: 'The ID of the brand translation',
  })
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  findById(@Param() params: GetBrandTranslationParamsDTO) {
    return this.brandTranslationService.findById(params.brandTranslationId);
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  create(@Body() body: CreateBrandTranslationBodyDTO, @User('userId') userId: number) {
    return this.brandTranslationService.create({
      data: body,
      createdById: userId,
    });
  }

  @Put(':brandTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'brandTranslationId',
    type: Number,
    description: 'The ID of the brand translation',
  })
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  update(
    @Body() body: UpdateBrandTranslationBodyDTO,
    @Param() params: GetBrandTranslationParamsDTO,
    @User('userId') userId: number,
  ) {
    return this.brandTranslationService.update({
      data: body,
      id: params.brandTranslationId,
      updatedById: userId,
    });
  }

  @Delete(':brandTranslationId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'brandTranslationId',
    type: Number,
    description: 'The ID of the brand translation',
  })
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetBrandTranslationParamsDTO, @User('userId') userId: number) {
    return this.brandTranslationService.delete({
      id: params.brandTranslationId,
      deletedById: userId,
    });
  }
}
