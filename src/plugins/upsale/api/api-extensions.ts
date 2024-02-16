import { gql } from "graphql-tag";

export const commonApiExtensions = gql`
	type UpSale implements Node {
		id: ID!
		productVariant: ProductVariant!
		status: Int!
		quantity: Int!
		options: [String!]
	}

	type UpSaleList implements PaginatedList {
		items: [UpSale!]!
		totalItems: Int!
	}

	input UpSaleListOptions {
		take: Int!
		skip: Int!
	}
`;

export const adminApiExtensions = gql`
	${commonApiExtensions}

	extend type Query {
		listByProduct(productVariantId: ID!): UpSaleList!
		getUpsale(id: ID!): UpSale!
	}

	extend type Mutation {
		addUpsaleToProduct(input: AddUpsaleToProductInput!): UpSale!
		updateUpsale(input: UpdateUpsaleInput!): UpSale!
		removeUpsale(id: ID!): Boolean!
	}

	input AddUpsaleToProductInput {
		mainProductVariantId: ID!
		productVariantId: ID!
		quantity: Int!
	}

	input UpdateUpsaleInput {
		id: ID!
		quantity: Int!
	}
`;

export const shopApiExtensions = gql`
	${commonApiExtensions}

	extend type Query {
		listByProduct(productVariantId: ID!): UpSaleList!
	}
`;
