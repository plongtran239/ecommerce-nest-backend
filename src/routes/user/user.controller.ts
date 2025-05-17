import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  GetDetailUserResDTO,
  GetUserParamsDTO,
  GetUsersQueryDTO,
  GetUsersResDTO,
  UpdateUserBodyDTO,
  UpdateUserResDTO,
} from 'src/routes/user/user.dto';
import { UserService } from 'src/routes/user/user.service';
import { Role } from 'src/shared/decorators/role.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(CreateUserResDTO)
  create(@Body() body: CreateUserBodyDTO, @User('userId') userId: number, @Role('name') roleName: string) {
    return this.userService.create({
      data: body,
      createdById: userId,
      createdByRoleName: roleName,
    });
  }

  @Get()
  @ApiBearerAuth()
  @ZodSerializerDto(GetUsersResDTO)
  getList(@Query() query: GetUsersQueryDTO) {
    return this.userService.list({
      limit: query.limit,
      page: query.page,
    });
  }

  @Get(':userId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'The ID of the user',
  })
  @ZodSerializerDto(GetDetailUserResDTO)
  getById(@Param() param: GetUserParamsDTO) {
    return this.userService.getById(param.userId);
  }

  @Put(':userId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'The ID of the user',
  })
  @ZodSerializerDto(UpdateUserResDTO)
  update(
    @Param() param: GetUserParamsDTO,
    @Body() body: UpdateUserBodyDTO,
    @User('userId') userId: number,
    @Role('name') roleName: string,
  ) {
    return this.userService.update({
      id: param.userId,
      data: body,
      updatedById: userId,
      updatedByRoleName: roleName,
    });
  }

  @Delete(':userId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'The ID of the user',
  })
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() param: GetUserParamsDTO, @User('userId') userId: number, @Role('name') roleName: string) {
    return this.userService.delete({
      id: param.userId,
      deletedById: userId,
      deletedByRoleName: roleName,
    });
  }
}
