import { gql } from "graphql-tag";

export const commonApiExtensions = gql`
	type Page implements Node {
		id: ID!
		createdAt: DateTime!
		updatedAt: DateTime!
		status: String!
		title: String!
		content: String!
		meta_description: String!
		show_in_nav: Boolean!
		nav: String!
		slug: String!
		sort_order: Int!
		featured_image: Asset
		parent: Page
		meta_keyword: String!
		meta_title: String!
	}

	enum PageStatus {
		Draft
		Published
	}

	type PageList implements PaginatedList {
		items: [Page!]!
		totalItems: Int!
	}

	input PageListOptions
`;

export const adminApiExtensions = gql`
	${commonApiExtensions}

	extend type Query {
		pages(options: PageListOptions): PageList!
		page(id: ID!): Page
	}

	extend type Mutation {
		createPage(input: CreatePageInput!): Page!
		updatePage(input: UpdatePageInput!): Page!
		deletePage(id: ID!): DeletionResponse!
		deletePages(ids: [ID!]!): [DeletionResponse!]!
	}

	input CreatePageInput {
		title: String!
		content: String!
		meta_description: String!
		show_in_nav: Boolean!
		slug: String!
		sort_order: Int!
		featured_image_id: ID
		parent_id: ID
		status: String!
		nav: String!
		meta_keyword: String!
		meta_title: String!
	}

	input UpdatePageInput {
		id: ID!
		title: String
		content: String
		meta_description: String
		show_in_nav: Boolean
		slug: String
		sort_order: Int
		featured_image_id: ID
		parent_id: ID
		status: String
		nav: String
		meta_keyword: String
		meta_title: String
	}
`;

export const shopApiExtensions = gql`
	${commonApiExtensions}

	extend type Query {
		pages(options: PageListOptions): PageList!
		pageBySlug(slug: String!): Page
	}
`;
