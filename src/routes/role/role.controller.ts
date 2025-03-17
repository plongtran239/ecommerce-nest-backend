import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateRoleBodyDTO,
  CreateRoleResDTO,
  GetRoleParamsDTO,
  GetRolesQueryDTO,
  GetRolesResDTO,
  UpdateRoleBodyDTO,
} from 'src/routes/role/role.dto';
import { RoleService } from 'src/routes/role/role.service';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ZodSerializerDto(CreateRoleResDTO)
  create(@Body() body: CreateRoleBodyDTO, @User('userId') userId: number) {
    return this.roleService.create({
      data: body,
      createdById: userId,
    });
  }

  @Get()
  @ZodSerializerDto(GetRolesResDTO)
  getList(@Query() query: GetRolesQueryDTO) {
    return this.roleService.getList(query);
  }

  @Get(':roleId')
  getById(@Param() params: GetRoleParamsDTO) {
    return this.roleService.getById(params.roleId);
  }

  @Put(':roleId')
  update(@Param() params: GetRoleParamsDTO, @Body() body: UpdateRoleBodyDTO, @User('userId') userId: number) {
    return this.roleService.update({
      id: params.roleId,
      data: body,
      updatedById: userId,
    });
  }

  @Delete(':roleId')
  delete(@Param() params: GetRoleParamsDTO, @User('userId') userId: number) {
    return this.roleService.delete({
      id: params.roleId,
      deletedById: userId,
    });
  }
}
