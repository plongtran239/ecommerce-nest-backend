import { Injectable } from '@nestjs/common';

import { CreateOrderBodyType, GetOrderListQueryType } from 'src/routes/order/order.model';
import { OrderRepository } from 'src/routes/order/order.repository';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async list({ query, userId }: { query: GetOrderListQueryType; userId: number }) {
    return this.orderRepository.list({ query, userId });
  }

  async create({ body, userId }: { body: CreateOrderBodyType; userId: number }) {
    return this.orderRepository.create({ data: body, userId });
  }
}
