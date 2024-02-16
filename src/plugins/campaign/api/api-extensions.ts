import { gql } from "graphql-tag";

export const commonApiExtensions = gql`
	type Campaign implements Node {
		id: ID!
		createdAt: DateTime!
		updatedAt: DateTime!
		name: String!
		product: Product!
		active: Boolean!
		productVariants: [ProductVariant!]!
		defaultVariantIds: [String]
		header: String
		subHeader: String
		buttonText: String
	}

	type CampaignList implements PaginatedList {
		items: [Campaign!]!
		totalItems: Int!
	}

	input CampaignListOptions {
		take: Int
		skip: Int
		sort: CampaignSortParameter
	}

	input CampaignSortParameter {
		createdAt: SortOrder
		updatedAt: SortOrder
		name: SortOrder
	}
`;

export const adminApiExtensions = gql`
	${commonApiExtensions}

	extend type Query {
		campaign(id: ID!): Campaign
		campaigns(options: CampaignListOptions): CampaignList!
	}

	extend type Mutation {
		createCampaign(input: CreateCampaignInput!): Campaign!
		updateCampaign(input: UpdateCampaignInput!): Campaign!
		# updateCampaignVariants(input: UpdateCampaignVariantInput!): Campaign!
		deleteCampaign(id: ID!): DeletionResponse!
		deleteCampaigns(ids: [ID!]!): [DeletionResponse!]!
	}

	input CreateCampaignInput {
		name: String!
		product: ID!
		active: Boolean!
		productVariants: [ID!]!
		defaultVariantIds: [String]!
		header: String
		subHeader: String
		buttonText: String
	}

	input UpdateCampaignInput {
		id: ID!
		name: String
		active: Boolean
		header: String
		subHeader: String
		buttonText: String
		productVariants: [ID!]
		defaultVariantIds: [String]
		product: ID
	}

	input UpdateCampaignVariantInput {
		id: ID!
		productVariants: [ID!]!
		defaultVariantIds: [String]!
	}
`;

export const shopApiExtensions = gql`
	${commonApiExtensions}

	extend type Query {
		campaign(productId: ID!): Campaign
	}
`;
