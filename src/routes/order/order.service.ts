import { Injectable } from '@nestjs/common';

import { OrderNotFoundException } from 'src/routes/order/order.error';
import { CreateOrderBodyType, GetOrderListQueryType } from 'src/routes/order/order.model';
import { OrderRepository } from 'src/routes/order/order.repository';
import { isPrismaNotFoundError } from 'src/shared/helpers';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async list({ query, userId }: { query: GetOrderListQueryType; userId: number }) {
    return this.orderRepository.list({ query, userId });
  }

  async create({ body, userId }: { body: CreateOrderBodyType; userId: number }) {
    return this.orderRepository.create({ data: body, userId });
  }

  async getDetail({ orderId, userId }: { orderId: number; userId: number }) {
    const order = await this.orderRepository.findById({ orderId, userId });

    if (!order) {
      throw OrderNotFoundException;
    }

    return order;
  }

  async cancel({ orderId, userId }: { orderId: number; userId: number }) {
    try {
      return await this.orderRepository.cancel({ orderId, userId });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw OrderNotFoundException;
      }
      throw error;
    }
  }
}
