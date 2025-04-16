import { z } from 'zod';

import { PaginationSchema } from 'src/shared/models/pagination.model';
import { ProductTranslationSchema } from 'src/shared/models/share-product-translation.model';
import { ProductSchema } from 'src/shared/models/shared-product.model';
import { SKUSchema } from 'src/shared/models/shared-sku.model';

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  skuId: z.number(),
  userId: z.number(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetCartItemParamsSchema = z
  .object({
    cartItemId: z.coerce.number().int().positive(),
  })
  .strict();

export const CartItemDetailSchema = CartItemSchema.extend({
  sku: SKUSchema.extend({
    product: ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  }),
});

export const GetCartResSchema = PaginationSchema.extend({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number(),
});

export const AddToCartBodySchema = z
  .object({
    skuId: z.number(),
    quantity: z.number(),
  })
  .strict();

export const UpdateCartItemBodySchema = AddToCartBodySchema;

export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()),
  })
  .strict();

export type CartItemType = z.infer<typeof CartItemSchema>;
export type GetCartItemParamsType = z.infer<typeof GetCartItemParamsSchema>;
export type GetCartResType = z.infer<typeof GetCartResSchema>;
export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>;
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>;
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>;
