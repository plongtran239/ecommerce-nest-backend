import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  AddToCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartItemParamsDTO,
  GetCartResDTO,
  UpdateCartItemBodyDTO,
} from 'src/routes/cart/cart.dto';
import { CartService } from 'src/routes/cart/cart.service';
import { User } from 'src/shared/decorators/user.decorator';
import { PaginationQueryDTO } from 'src/shared/dtos/pagination.dto';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiBearerAuth()
  @ZodSerializerDto(GetCartResDTO)
  async findAll(@Query() query: PaginationQueryDTO, @User('userId') userId: number) {
    return this.cartService.findAll({ query, userId });
  }

  @Post()
  @ApiBearerAuth()
  @ZodSerializerDto(CartItemDTO)
  async create(@Body() body: AddToCartBodyDTO, @User('userId') userId: number) {
    return this.cartService.create({ body, userId });
  }

  @Put(':cartItemId')
  @ApiBearerAuth()
  @ZodSerializerDto(CartItemDTO)
  async update(
    @Param() params: GetCartItemParamsDTO,
    @Body() body: UpdateCartItemBodyDTO,
    @User('userId') userId: number,
  ) {
    return this.cartService.update({ cartItemId: params.cartItemId, body, userId });
  }

  @Post('delete')
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResDTO)
  async delete(@Body() body: DeleteCartBodyDTO, @User('userId') userId: number) {
    return this.cartService.delete({ body, userId });
  }
}
