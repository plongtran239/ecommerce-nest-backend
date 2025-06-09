export const ALL_LANGUAGE_CODE = 'all';

export const ORDER_BY = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const SORT_BY = {
  PRICE: 'price',
  CREATED_AT: 'createdAt',
  SALE: 'sale',
} as const;

export const PREFIX_PAYMENT_CODE = 'DH';

export type OrderByType = (typeof ORDER_BY)[keyof typeof ORDER_BY];
export type SortByType = (typeof SORT_BY)[keyof typeof SORT_BY];

export const NODE_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;
