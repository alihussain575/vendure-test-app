import { Injectable, NotFoundException } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext, TransactionalConnection } from '@vendure/core';

import { ProductType } from '../entities/product-type.entitiy';

@Injectable()
export class ProductAdditionalDetailsService {
  constructor(private connection: TransactionalConnection) {}

  async createProductAdditionalDetails(
    ctx: RequestContext,
    input: ProductType
  ): Promise<ProductType> {
    const newDetails = new ProductType(input);
    return await this.connection.getRepository(ProductType).save(newDetails);
  }

  async updateProductAdditionalDetails(
    ctx: RequestContext,
    input: ProductType
  ): Promise<ProductType> {
    const details = await this.getProductAdditionalDetailsForProduct(
      ctx,
      input.productId
    );
    if (!details) {
      return await this.createProductAdditionalDetails(ctx, {
        ...input,
        productId: input.productId
      });
    }
    return await this.connection.getRepository(ctx, ProductType).save(input);
  }

  async getProductAdditionalDetailsForProduct(
    ctx: RequestContext,
    productId: ID
  ): Promise<ProductType | undefined | null> {
    return await this.connection.getRepository(ctx, ProductType).findOne({
      where: { product: { id: productId } },
    });
  }

  async getProductAdditionalDetails(
    ctx: RequestContext,
    id: ID
  ): Promise<ProductType | undefined | null> {
    return await this.connection
      .getRepository(ctx, ProductType)
      .findOne({ where: { id } });
  }
}
