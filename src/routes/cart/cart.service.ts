import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import { NotFoundCartItemException } from 'src/routes/cart/cart.error';
import {
  AddToCartBodyType,
  CartItemType,
  DeleteCartBodyType,
  GetCartResType,
  UpdateCartItemBodyType,
} from 'src/routes/cart/cart.model';
import { CartRepository } from 'src/routes/cart/cart.repository';
import { isPrismaNotFoundError } from 'src/shared/helpers';
import { PaginationQueryType } from 'src/shared/models/pagination.model';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async findAll({ query, userId }: { query: PaginationQueryType; userId: number }): Promise<GetCartResType> {
    return await this.cartRepository.list(query, userId, I18nContext.current()?.lang as string);
  }

  async create({ body, userId }: { body: AddToCartBodyType; userId: number }): Promise<CartItemType> {
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
    try {
      return await this.cartRepository.update({ cartItemId, data: body, userId });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundCartItemException;
      }

      throw error;
    }
  }

  async delete({ body, userId }: { body: DeleteCartBodyType; userId: number }): Promise<{ message: string }> {
    const { count } = await this.cartRepository.delete({ body, userId });

    return {
      message: `Delete ${count} cart item(s) successfully`,
    };
  }
}
