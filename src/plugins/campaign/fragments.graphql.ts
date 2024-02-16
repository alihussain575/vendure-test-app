import { gql } from "graphql-tag";

export const CAMPAIGN_FRAGMENT = gql`
	fragment Campaign on Campaign {
		id
		name
		createdAt
		updatedAt
		product {
			id
			name
			slug
			featuredAsset {
				preview
			}
		}
		active
		productVariants {
			id
			name
			sku
			featuredAsset {
				preview
			}
			options {
				name
			}
			product {
				id
				name
				slug
				featuredAsset {
					preview
				}
			}
		}
		defaultVariantIds
		header
		subHeader
		buttonText
	}
`;

export const LIST_CAMPAIGNS = gql`
	query ListCampaigns($options: CampaignListOptions) {
		campaigns(options: $options) {
			items {
				...Campaign
			}
			totalItems
		}
	}
`;

export const GET_CAMPAIGN = gql`
	query GetCampaign($id: ID!) {
		campaign(id: $id) {
			...Campaign
		}
	}
`;

export const CREATE_CAMPAIGN = gql`
	mutation CreateCampaign($input: CreateCampaignInput!) {
		createCampaign(input: $input) {
			...Campaign
		}
	}
`;

export const UPDATE_CAMPAIGN = gql`
	mutation UpdateCampaign($input: UpdateCampaignInput!) {
		updateCampaign(input: $input) {
			...Campaign
		}
	}
`;

export const DELETE_CAMPAIGN = gql`
	mutation DeleteCampaign($id: ID!) {
		deleteCampaign(id: $id) {
			result
		}
	}
`;

export const DELETE_CAMPAIGNS = gql`
	mutation DeleteCampaigns($ids: [ID!]!) {
		deleteCampaigns(ids: $ids) {
			result
		}
	}
`;

export const LIST_PRODUCT_WITH_OPTIONS = gql`
	query ListProduct($options: ProductListOptions) {
		products(options: $options) {
			totalItems
			items {
				id
				createdAt
				updatedAt
				enabled
				languageCode
				name
				slug
				optionGroups {
					name
					code
				}
				featuredAsset {
					id
					createdAt
					updatedAt
					preview
					focalPoint {
						x
						y
					}
				}
				variantList {
					totalItems
					items {
						name
						id
						options {
							name
							code
						}
					}
				}
			}
		}
	}
`;
