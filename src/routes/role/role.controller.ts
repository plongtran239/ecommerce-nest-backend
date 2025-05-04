import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateRoleBodyDTO,
  CreateRoleResDTO,
  GetDetailRoleResDTO,
  GetRoleParamsDTO,
  GetRolesQueryDTO,
  GetRolesResDTO,
  UpdateRoleBodyDTO,
  UpdateRoleResDTO,
} from 'src/routes/role/role.dto';
import { RoleService } from 'src/routes/role/role.service';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(CreateRoleResDTO)
  create(@Body() body: CreateRoleBodyDTO, @User('userId') userId: number) {
    return this.roleService.create({
      data: body,
      createdById: userId,
    });
  }

  @Get()
  @ApiBearerAuth()
  @ZodSerializerDto(GetRolesResDTO)
  getList(@Query() query: GetRolesQueryDTO) {
    return this.roleService.getList(query);
  }

  @Get(':roleId')
  @ApiBearerAuth()
  @ZodSerializerDto(GetDetailRoleResDTO)
  getById(@Param() params: GetRoleParamsDTO) {
    return this.roleService.getById(params.roleId);
  }

  @Put(':roleId')
  @ApiBearerAuth()
  @ZodSerializerDto(UpdateRoleResDTO)
  update(@Param() params: GetRoleParamsDTO, @Body() body: UpdateRoleBodyDTO, @User('userId') userId: number) {
    return this.roleService.update({
      id: params.roleId,
      data: body,
      updatedById: userId,
    });
  }

  @Delete(':roleId')
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetRoleParamsDTO, @User('userId') userId: number) {
    return this.roleService.delete({
      id: params.roleId,
      deletedById: userId,
    });
  }
}
