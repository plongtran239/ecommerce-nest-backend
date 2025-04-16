import { z } from 'zod';

import { UpsertSKUBodySchema } from 'src/routes/product/sku.model';
import { ORDER_BY, SORT_BY } from 'src/shared/constants/other.constant';
import { PaginationQuerySchema, PaginationSchema } from 'src/shared/models/pagination.model';
import { ProductTranslationSchema } from 'src/shared/models/share-product-translation.model';
import { BrandIncludeTranslationSchema } from 'src/shared/models/shared-brand.model';
import { CategoryIncludeTranslationSchema } from 'src/shared/models/shared-category.model';
import { ProductSchema, VariantsType } from 'src/shared/models/shared-product.model';
import { SKUSchema } from 'src/shared/models/shared-sku.model';

function generateSKUs(variants: VariantsType) {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), ['']);
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options);

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options);

  // Chuyển tổ hợp thành SKU objects
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: '',
  }));
}

export const GetProductsQuerySchema = PaginationQuerySchema.extend({
  name: z.string().optional(),
  brandIds: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        return [Number(val)];
      }
      return val;
    }, z.array(z.coerce.number().int().positive()))
    .optional(),
  categoryIds: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return [Number(value)];
      }
      return value;
    }, z.array(z.coerce.number().int().positive()))
    .optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  createdById: z.coerce.number().int().positive().optional(),
  orderBy: z.enum([ORDER_BY.ASC, ORDER_BY.DESC]).default(ORDER_BY.DESC),
  sortBy: z.enum([SORT_BY.PRICE, SORT_BY.CREATED_AT, SORT_BY.SALE]).default(SORT_BY.CREATED_AT),
});

export const GetManageProductsQuerySchema = GetProductsQuerySchema.extend({
  createdById: z.coerce.number().int().positive(),
  isPublic: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === undefined) return undefined;
    return val;
  }, z.boolean().optional()),
});

export const GetProductsResSchema = PaginationSchema.extend({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
});

export const GetProductParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict();

export const GetProductDetailResSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
  brand: BrandIncludeTranslationSchema,
});

export const CreateProductBodySchema = ProductSchema.pick({
  publishedAt: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    // Kiểm tra xem số lượng SKU có hợp lệ hay không
    const skuValueArray = generateSKUs(variants);
    if (skus.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `Số lượng SKU nên là ${skuValueArray.length}. Vui lòng kiểm tra lại.`,
      });
    }

    // Kiểm tra từng SKU có hợp lệ hay không
    let wrongSKUIndex = -1;
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value;
      if (!isValid) {
        wrongSKUIndex = index;
      }
      return isValid;
    });
    if (!isValidSKUs) {
      ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ. Vui lòng kiểm tra lại.`,
      });
    }
  });

export const UpdateProductBodySchema = CreateProductBodySchema;

export type GetProductsResType = z.infer<typeof GetProductsResSchema>;
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>;
export type GetManageProductsQueryType = z.infer<typeof GetManageProductsQuerySchema>;
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>;
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>;
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;
