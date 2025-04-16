import { BadRequestException, NotFoundException } from '@nestjs/common';

export const NotFoundSKUException = new NotFoundException('Error.SKU.NotFound');

export const OutOfStockSKUException = new BadRequestException('Error.SKU.OutOfStock');

export const NotEnoughStockSKUException = new BadRequestException('Error.SKU.NotEnoughStock');

export const NotFoundProductException = new NotFoundException('Error.Product.NotFound');

export const NotFoundCartItemException = new NotFoundException('Error.CartItem.NotFound');
