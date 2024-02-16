import gql from 'graphql-tag';

export const PRODUCT_DETAILS_FRAGMENT = gql`
  query ProductDetails($id: ID!) {
    productAdditionalDetailsForProduct(productId: $id) {
      # id
      slogan
      alternateName
      additionalType
      disambiguatingDescription
      oneWordName
      isService
      serviceOutput
      serviceType
      repetitions
      meta_title
      meta_keyword
      meta_description
      productId
    }
  }
`;

export const GET_PRODUCT_DETAILS_BY_PRODUCT_ID = gql`
  query getProductTypesForProduct($productId: ID!) {
    productAdditionalDetailsForProduct(productId: $productId) {
      slogan
      alternateName
      additionalType
      disambiguatingDescription
      oneWordName
      isService
      serviceOutput
      serviceType
      repetitions
      meta_title
      meta_keyword
      meta_description
    }
  }
`;

export const CREATE_PRODUCT_DETAILS = gql`
  mutation CreateProductDetails($input: CreateProductTypeInput!) {
    createProductAdditionalDetails(input: $input) {
      # id
      slogan
      alternateName
      additionalType
      disambiguatingDescription
      oneWordName
      isService
      serviceOutput
      serviceType
      repetitions
      meta_title
      meta_keyword
      meta_description
      productId
    }
  }
`;

export const UPDATE_PRODUCT_DETAILS = gql`
  mutation UpdateProductDetails($input: UpdateProductTypeInput!) {
    updateProductAdditionalDetails(input: $input) {
      # id
      slogan
      alternateName
      additionalType
      disambiguatingDescription
      oneWordName
      isService
      serviceOutput
      serviceType
      repetitions
      meta_title
      meta_keyword
      meta_description
      productId
    }
  }
`;
