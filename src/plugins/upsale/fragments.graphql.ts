import { gql } from "graphql-tag";

export const GET_PRODUCT_VARIANT = gql`
	query getProductVariant($id: ID!) {
		productVariant(id: $id) {
			id
			name
			price
			priceWithTax
			featuredAsset {
				preview
			}
			sku
			stockAllocated
			stockLevel
			stockOnHand
			product {
				id
				name
				featuredAsset {
					preview
				}
				slug
				optionGroups {
					id
					name
					options {
						name
						code
					}
				}
			}
		}
	}
`;

export const UPSALE_FRAGMENT = gql`
	fragment UpSale on UpSale {
		id
		quantity
		options
		productVariant {
			id
			name
			price
			currencyCode
			priceWithTax
			featuredAsset {
				preview
			}
		}
	}
`;

export const LIST_UPSALE_BY_PRODUCT = gql`
	query listUpsaleByProduct($productVariantId: ID!) {
		listByProduct(productVariantId: $productVariantId) {
			totalItems
			items {
				...UpSale
			}
		}
	}
`;

export const GET_UPSALE = gql`
	query getUpsale($id: ID!) {
		getUpsale(id: $id) {
			...UpSale
		}
	}
`;

export const ADD_UPSALE_TO_PRODUCT = gql`
	mutation addUpsaleToProduct($input: AddUpsaleToProductInput!) {
		addUpsaleToProduct(input: $input) {
			...UpSale
		}
	}
`;

export const UPDATE_UPSALE = gql`
	mutation updateUpsale($input: UpdateUpsaleInput!) {
		updateUpsale(input: $input) {
			...UpSale
		}
	}
`;

export const REMOVE_UPSALE = gql`
	mutation removeUpsale($id: ID!) {
		removeUpsale(id: $id)
	}
`;
