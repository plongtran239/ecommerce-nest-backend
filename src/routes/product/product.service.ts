import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import { GetProductsQueryType } from 'src/routes/product/product.model';
import { ProductRepository } from 'src/routes/product/product.repository';
import { NotFoundRecordException } from 'src/shared/error';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async list(query: GetProductsQueryType) {
    return await this.productRepository.list({
      ...query,
      languageId: I18nContext.current()?.lang as string,
      isPublic: true,
    });
  }

  async getDetail(id: number) {
    const product = await this.productRepository.findDetail({
      id,
      languageId: I18nContext.current()?.lang as string,
      isPublic: true,
    });

    if (!product) {
      throw NotFoundRecordException;
    }

    return product;
  }
}
