import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateLanguageBodyDTO,
  CreateLanguageResDTO,
  GetDetailLanguageResDTO,
  GetLanguageParamsDTO,
  GetLanguagesResDTO,
  UpdateLanguageBodyDTO,
  UpdateLanguageResDTO,
} from 'src/routes/language/language.dto';
import { LanguageService } from 'src/routes/language/language.service';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(CreateLanguageResDTO)
  create(@Body() body: CreateLanguageBodyDTO, @User('userId') userId: number) {
    return this.languageService.create({
      data: body,
      createdById: userId,
    });
  }

  @Get()
  @ApiBearerAuth()
  @ZodSerializerDto(GetLanguagesResDTO)
  getAll() {
    return this.languageService.getAll();
  }

  @Get(':languageId')
  @ApiBearerAuth()
  @ZodSerializerDto(GetDetailLanguageResDTO)
  getById(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.getById(params.languageId);
  }

  @Put(':languageId')
  @ApiBearerAuth()
  @ZodSerializerDto(UpdateLanguageResDTO)
  update(@Param() params: GetLanguageParamsDTO, @Body() body: UpdateLanguageBodyDTO, @User('userId') userId: number) {
    return this.languageService.update({
      id: params.languageId,
      data: body,
      updatedById: userId,
    });
  }

  @Delete(':languageId')
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetLanguageParamsDTO, @User('userId') userId: number) {
    return this.languageService.delete({
      id: params.languageId,
      deletedById: userId,
    });
  }
}
