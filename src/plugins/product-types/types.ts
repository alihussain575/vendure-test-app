import { ProductType } from './entities/product-type.entitiy';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
  interface CustomProductFields {
    productType: ProductType;
  }
}