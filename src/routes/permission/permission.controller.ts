import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreatePermissionBodyDTO,
  CreatePermissionResDTO,
  GetDetailPermissionResDTO,
  GetPermissionsQueryDTO,
  GetPermissionsResDTO,
  GetPermisstionParamsDTO,
  UpdatePermissionBodyDTO,
  UpdatePermissionResDTO,
} from 'src/routes/permission/permission.dto';
import { PermissionService } from 'src/routes/permission/permission.service';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('permissions')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(CreatePermissionResDTO)
  create(@Body() body: CreatePermissionBodyDTO, @User('userId') userId: number) {
    return this.permissionService.create({
      data: body,
      createdById: userId,
    });
  }

  @Get()
  @ApiBearerAuth()
  @ZodSerializerDto(GetPermissionsResDTO)
  getList(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionService.getList(query);
  }

  @Get(':permissionId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'permissionId',
    type: Number,
    description: 'The ID of the permission',
  })
  @ZodSerializerDto(GetDetailPermissionResDTO)
  getById(@Param() params: GetPermisstionParamsDTO) {
    return this.permissionService.getById(params.permissionId);
  }

  @Put(':permissionId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'permissionId',
    type: Number,
    description: 'The ID of the permission',
  })
  @ZodSerializerDto(UpdatePermissionResDTO)
  update(
    @Param() params: GetPermisstionParamsDTO,
    @Body() body: UpdatePermissionBodyDTO,
    @User('userId') userId: number,
  ) {
    return this.permissionService.update({
      id: params.permissionId,
      data: body,
      updatedById: userId,
    });
  }

  @Delete(':permissionId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'permissionId',
    type: Number,
    description: 'The ID of the permission',
  })
  delete(@Param() params: GetPermisstionParamsDTO, @User('userId') userId: number) {
    return this.permissionService.delete({
      id: params.permissionId,
      deletedById: userId,
    });
  }
}
