import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { CreateOrderBodyDTO, GetOrderListQueryDTO, GetOrderParamsDTO } from 'src/routes/order/order.dto';
import { OrderService } from 'src/routes/order/order.service';
import { User } from 'src/shared/decorators/user.decorator';
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async list(@Query() query: GetOrderListQueryDTO, @User('userId') userId: number) {
    return this.orderService.list({ query, userId });
  }

  @Get(':orderId')
  async getDetail(@Param() params: GetOrderParamsDTO, @User('userId') userId: number) {
    return this.orderService.getDetail({ orderId: params.orderId, userId });
  }

  @Post()
  async create(@Body() body: CreateOrderBodyDTO, @User('userId') userId: number) {
    return this.orderService.create({ body, userId });
  }

  @Put(':orderId')
  async cancel(@Param() params: GetOrderParamsDTO, @User('userId') userId: number, @Body() _: EmptyBodyDTO) {
    return this.orderService.cancel({ orderId: params.orderId, userId });
  }
}
