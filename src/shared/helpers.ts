import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { randomInt } from 'crypto';

export const isPrismaUniqueConstraintError = (error: any): error is PrismaClientKnownRequestError => {
  return isPrismaKnownRequestError(error) && error.code === 'P2002';
};

export const isPrismaForeignKeyConstraintError = (error: any): error is PrismaClientKnownRequestError => {
  return isPrismaKnownRequestError(error) && error.code === 'P2003';
};

export const isPrismaNotFoundError = (error: any): error is PrismaClientKnownRequestError => {
  return isPrismaKnownRequestError(error) && error.code === 'P2025';
};

const isPrismaKnownRequestError = (error: any): error is PrismaClientKnownRequestError => {
  return error instanceof PrismaClientKnownRequestError;
};

export const generateOTPCode = () => {
  return randomInt(100000, 1000000).toString();
};

export const generateRandomFileName = (fileName: string) => {
  const extension = path.extname(fileName);
  return `${uuidv4()}${extension}`;
};

export const generateCancelPaymentJobId = (paymentId: number) => {
  return `payment-id-${paymentId}`;
};

export const generateUserIdRoom = (userId: number) => {
  return `user-id-${userId}`;
};

export const generateCacheKeyRole = (roleId: number) => {
  return `role:${roleId}`;
};

export const generateSkuIdLock = (skuId: number) => {
  return `lock:${skuId}`;
};
