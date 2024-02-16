import { gql } from "graphql-tag";

export const commonApiExtensions = gql`
	type WishListItem implements Node {
		id: ID!
		productVariant: ProductVariant!
		customer: Customer!
		status: Int!
	}

	type WishList implements PaginatedList {
		items: [WishListItem!]!
		totalItems: Int!
	}

	# Auto-generated at runtime
	input WishListOptions {
		skip: Int
		take: Int
	}
`;

export const adminApiExtensions = gql`
	${commonApiExtensions}

	# extend type Query {
	#     payments(options: PaymentListOptions): PaymentList!
	#     # payment(id: ID!): Payment
	# }

	# extend type Mutation {
	#     updatePayment(input: UpdatePaymentInput!): Payment!
	#     approvePayment(id: ID!): Payment
	#     rejectPayment(id: ID!): Payment
	# }
`;

export const shopApiExtensions = gql`
	${commonApiExtensions}

	input AddWishListInput {
		productId: ID!
	}

	input RemoveWishListInput {
		productId: ID!
	}

	extend type Query {
		wishlist(options: WishListOptions): WishList!
		wishlistItem(productVariantId: ID!): WishListItem
	}

	extend type Mutation {
		addToWishlist(input: AddWishListInput!): WishListItem!
		removeWishListItem(wishListItemId: ID, productVariantId: ID): WishListItem!
	}
`;
