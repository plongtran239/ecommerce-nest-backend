import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { CreateOrderBodyDTO, GetOrderListQueryDTO } from 'src/routes/order/order.dto';
import { OrderService } from 'src/routes/order/order.service';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async list(@Query() query: GetOrderListQueryDTO, @User('userId') userId: number) {
    return this.orderService.list({ query, userId });
  }

  @Post()
  async create(@Body() body: CreateOrderBodyDTO, @User('userId') userId: number) {
    return this.orderService.create({ body, userId });
  }
}
