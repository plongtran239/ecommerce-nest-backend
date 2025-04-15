import { ForbiddenException, Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import {
  CreateProductBodyType,
  GetManageProductsQueryType,
  UpdateProductBodyType,
} from 'src/routes/product/product.model';
import { ProductRepository } from 'src/routes/product/product.repository';
import { RoleName } from 'src/shared/constants/role.constant';
import { NotFoundRecordException } from 'src/shared/error';
import { isPrismaNotFoundError } from 'src/shared/helpers';

@Injectable()
export class ManageProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  private validatePrivilege({
    userIdRequest,
    roleNameRequest,
    createdById,
  }: {
    userIdRequest: number;
    roleNameRequest: string;
    createdById: number | undefined | null;
  }) {
    if (userIdRequest !== createdById && roleNameRequest !== RoleName.Admin) {
      throw new ForbiddenException();
    }
    return true;
  }

  async list({
    query,
    userIdRequest,
    roleNameRequest,
  }: {
    query: GetManageProductsQueryType;
    userIdRequest: number;
    roleNameRequest: string;
  }) {
    this.validatePrivilege({
      userIdRequest,
      roleNameRequest,
      createdById: query.createdById,
    });

    const data = await this.productRepository.list({
      ...query,
      languageId: I18nContext.current()?.lang as string,
    });
    return data;
  }

  async getDetail(props: { productId: number; userIdRequest: number; roleNameRequest: string }) {
    const product = await this.productRepository.findDetail({
      id: props.productId,
      languageId: I18nContext.current()?.lang as string,
    });

    if (!product) {
      throw NotFoundRecordException;
    }

    this.validatePrivilege({
      userIdRequest: props.userIdRequest,
      roleNameRequest: props.roleNameRequest,
      createdById: product.createdById,
    });

    return product;
  }

  async create(payload: { data: CreateProductBodyType; createdById: number }) {
    return await this.productRepository.create(payload);
  }

  async update({
    id,
    data,
    updatedById,
    roleNameRequest,
  }: {
    id: number;
    data: UpdateProductBodyType;
    updatedById: number;
    roleNameRequest: string;
  }) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw NotFoundRecordException;
    }

    try {
      this.validatePrivilege({
        userIdRequest: updatedById,
        roleNameRequest,
        createdById: product.createdById,
      });

      return await this.productRepository.update({ id, data, updatedById });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById, roleNameRequest }: { id: number; deletedById: number; roleNameRequest: string }) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw NotFoundRecordException;
    }

    this.validatePrivilege({
      userIdRequest: deletedById,
      roleNameRequest,
      createdById: product.createdById,
    });

    try {
      await this.productRepository.delete({ id, deletedById });
      return {
        message: 'Delete product successfully',
      };
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
