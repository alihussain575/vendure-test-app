import gql from "graphql-tag";

export const PAGE_FRAGMENT = gql`
	fragment Page on Page {
		id
		createdAt
		updatedAt
		status
		title
		content
		meta_description
		show_in_nav
		nav
		slug
		sort_order
		featured_image {
			id
			preview
		}
		parent {
			id
			title
		}
		meta_title
		meta_keyword
	}
`;

export const GET_PAGES = gql`
	query GetPages($options: PageListOptions) {
		pages(options: $options) {
			items {
				...Page
			}
			totalItems
		}
	}
`;

export const GET_PAGE = gql`
	query GetPage($id: ID!) {
		page(id: $id) {
			...Page
		}
	}
`;

export const CREATE_PAGE = gql`
	mutation CreatePage($input: CreatePageInput!) {
		createPage(input: $input) {
			...Page
		}
	}
`;

export const UPDATE_PAGE = gql`
	mutation UpdatePage($input: UpdatePageInput!) {
		updatePage(input: $input) {
			...Page
		}
	}
`;

export const DELETE_PAGE = gql`
	mutation DeletePage($id: ID!) {
		deletePage(id: $id) {
			result
		}
	}
`;

export const DELETE_PAGES = gql`
	mutation DeletePages($ids: [ID!]!) {
		deletePages(ids: $ids) {
			result
		}
	}
`;
