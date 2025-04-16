import { Module } from '@nestjs/common';

import { CartController } from 'src/routes/cart/cart.controller';
import { CartRepository } from 'src/routes/cart/cart.repository';
import { CartService } from 'src/routes/cart/cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
