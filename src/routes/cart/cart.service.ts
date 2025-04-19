import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import {
  AddToCartBodyType,
  CartItemType,
  DeleteCartBodyType,
  GetCartResType,
  UpdateCartItemBodyType,
} from 'src/routes/cart/cart.model';
import { CartRepository } from 'src/routes/cart/cart.repository';
import { PaginationQueryType } from 'src/shared/models/pagination.model';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async findAll({ query, userId }: { query: PaginationQueryType; userId: number }): Promise<GetCartResType> {
    return await this.cartRepository.list(query, userId, I18nContext.current()?.lang as string);
  }

  async create({ body, userId }: { body: AddToCartBodyType; userId: number }): Promise<CartItemType> {
    const existingCartItem = await this.cartRepository.findUnique({ userId_skuId: { skuId: body.skuId, userId } });

    if (existingCartItem) {
      return await this.cartRepository.update({
        cartItemId: existingCartItem.id,
        data: {
          skuId: existingCartItem.skuId,
          quantity: existingCartItem.quantity + body.quantity,
        },
        userId,
      });
    }

    return await this.cartRepository.create({ data: body, userId });
  }

  async update({
    cartItemId,
    body,
    userId,
  }: {
    cartItemId: number;
    body: UpdateCartItemBodyType;
    userId: number;
  }): Promise<CartItemType> {
    return await this.cartRepository.update({ cartItemId, data: body, userId });
  }

  async delete({ body, userId }: { body: DeleteCartBodyType; userId: number }): Promise<{ message: string }> {
    const { count } = await this.cartRepository.delete({ body, userId });

    return {
      message: `Delete ${count} cart item(s) successfully`,
    };
  }
}
