import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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
  @ZodSerializerDto(CreateLanguageResDTO)
  create(@Body() body: CreateLanguageBodyDTO, @User('userId') userId: number) {
    return this.languageService.create({
      data: body,
      createdById: userId,
    });
  }

  @Get()
  @ZodSerializerDto(GetLanguagesResDTO)
  getAll() {
    return this.languageService.getAll();
  }

  @Get(':languageId')
  @ZodSerializerDto(GetDetailLanguageResDTO)
  getById(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.getById(params.languageId);
  }

  @Put(':languageId')
  @ZodSerializerDto(UpdateLanguageResDTO)
  update(@Param() params: GetLanguageParamsDTO, @Body() body: UpdateLanguageBodyDTO, @User('userId') userId: number) {
    return this.languageService.update({
      id: params.languageId,
      data: body,
      updatedById: userId,
    });
  }

  @Delete(':languageId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.delete(params.languageId);
  }
}
