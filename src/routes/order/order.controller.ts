import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

import {
  CancelOrderResDTO,
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderDetailResDTO,
  GetOrderListQueryDTO,
  GetOrderListResDTO,
  GetOrderParamsDTO,
} from 'src/routes/order/order.dto';
import { OrderService } from 'src/routes/order/order.service';
import { User } from 'src/shared/decorators/user.decorator';
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  async list(@Query() query: GetOrderListQueryDTO, @User('userId') userId: number) {
    return this.orderService.list({ query, userId });
  }

  @Get(':orderId')
  @ZodSerializerDto(GetOrderDetailResDTO)
  async getDetail(@Param() params: GetOrderParamsDTO, @User('userId') userId: number) {
    return this.orderService.getDetail({ orderId: params.orderId, userId });
  }

  @Post()
  @ZodSerializerDto(CreateOrderResDTO)
  async create(@Body() body: CreateOrderBodyDTO, @User('userId') userId: number) {
    return this.orderService.create({ body, userId });
  }

  @Put(':orderId')
  @ZodSerializerDto(CancelOrderResDTO)
  async cancel(@Param() params: GetOrderParamsDTO, @User('userId') userId: number, @Body() _: EmptyBodyDTO) {
    return this.orderService.cancel({ orderId: params.orderId, userId });
  }
}
