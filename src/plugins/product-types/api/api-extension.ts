import { gql } from 'graphql-tag';

export const productAdminApiExtensions = gql`
  input RepetitionInput {
    transmissionDays: Int
    durationUnit: DurationUnit
  }

  enum DurationUnit {
    Days
    Weeks
    Months
  }

  type Repetition {
    transmissionDays: Int
    durationUnit: DurationUnit
  }

  type ProductType implements Node {
    id: ID!
    slogan: String!
    alternateName: String!
    additionalType: String!
    disambiguatingDescription: String!
    oneWordName: String!
    isService: Boolean!
    serviceOutput: String
    serviceType: String
    repetitions: [Int]!
    transmissionDays: Int
    durationUnit: DurationUnit
    meta_title: String!
    meta_keyword: String!
    meta_description: String!
    productId: ID!
  }

  extend type Query {
    productAdditionalDetails(id: ID!): ProductType!
    productAdditionalDetailsForProduct(productId: ID!): ProductType!
  }

  extend type Mutation {
    createProductAdditionalDetails(input: CreateProductTypeInput!): ProductType!
    updateProductAdditionalDetails(input: UpdateProductTypeInput!): ProductType!
  }

  input CreateProductTypeInput {
    slogan: String!
    alternateName: String!
    additionalType: String!
    disambiguatingDescription: String!
    transmissionDays: Int
    durationUnit: DurationUnit
    oneWordName: String!
    isService: Boolean!
    serviceOutput: String
    serviceType: String
    repetitions: [Int]!
    meta_title: String!
    meta_keyword: String!
    meta_description: String!
    productId: ID!
  }

  input UpdateProductTypeInput {
    id: ID
    slogan: String
    alternateName: String
    additionalType: String
    disambiguatingDescription: String
    oneWordName: String
    isService: Boolean
    serviceOutput: String
    serviceType: String
    repetitions: [Int]
    transmissionDays: Int
    durationUnit: DurationUnit
    meta_title: String
    meta_keyword: String
    meta_description: String
    productId:ID
  }
`;

// export const productShopApiExtensions = gql`
//   ${productAdminApiExtensions}
// `;
