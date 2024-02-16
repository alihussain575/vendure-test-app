import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Transaction,
  ID,
  Ctx,
  RequestContext,
} from '@vendure/core';
import { ProductType } from '../entities/product-type.entitiy';
import { ProductAdditionalDetailsService } from '../service/productType.service';

@Resolver()
export class ProductTypeResolver {
  constructor(
    private productAdditionalDetailsService: ProductAdditionalDetailsService
  ) {}

  @Query()
  productAdditionalDetails(
    @Ctx() ctx: RequestContext,
    @Args('id') id: ID
  ): Promise<ProductType | undefined | null> {
    return this.productAdditionalDetailsService.getProductAdditionalDetails(ctx, id);
  }

  @Query()
  productAdditionalDetailsForProduct(
    @Ctx() ctx: RequestContext,
    @Args('productId') productId: ID
  ): Promise<ProductType | undefined | null> {
    return this.productAdditionalDetailsService.getProductAdditionalDetailsForProduct(
      ctx,
      productId
    );
  }

  @Transaction()
  @Mutation()
  createProductAdditionalDetails(@Ctx() ctx: RequestContext, @Args('input') input: any) {
    return this.productAdditionalDetailsService.createProductAdditionalDetails(
      ctx,
      input
    );
  }

  @Transaction()
  @Mutation()
  updateProductAdditionalDetails(@Ctx() ctx: RequestContext, @Args('input') input: any) {
    return this.productAdditionalDetailsService.updateProductAdditionalDetails(
      ctx,
      input
    );
  }
}
