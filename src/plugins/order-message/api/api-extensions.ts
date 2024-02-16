import { gql } from "graphql-tag";

export const commonExtensions = gql`
	type OrderMessage implements Node {
		id: ID!
		createdAt: DateTime!
		updatedAt: DateTime!
		type: String!
		order: Order!
		status: Int!
		subject: String!
		to: String!
		from: String!
		message: String!
		createdBy: User
		toUser: User
		replyTo: OrderMessage
	}

	type OrderMessageList implements PaginatedList {
		items: [OrderMessage!]!
		totalItems: Int!
	}

	input OrderMessageListOptions
`;

export const adminApiExtensions = gql`
	${commonExtensions}

	extend type Query {
		allOrderMessages(options: OrderMessageListOptions): OrderMessageList!
		getOrderMessages(
			orderId: ID!
			options: OrderMessageListOptions
		): OrderMessageList!
		getOrderMessage(id: ID!): OrderMessage
	}

	extend type Mutation {
		createOrderMessage(input: CreateOrderMessageInput!): OrderMessage!
		updateOrderMessage(input: UpdateOrderMessageInput!): OrderMessage!
		deleteOrderMessage(id: ID!): DeletionResponse!
		deleteOrderMessages(ids: [ID!]!): [DeletionResponse!]!
		markAsRead(id: ID!): OrderMessage!
	}

	input CreateOrderMessageInput {
		type: String!
		orderId: ID!
		status: Int
		subject: String
		to: String
		from: String
		message: String
		replyToId: ID
	}

	input UpdateOrderMessageInput {
		id: ID!
		status: Int
		subject: String
		message: String
	}
`;

export const shopApiExtentions = gql`
	${commonExtensions}

	extend type Query {
		orderMessages(options: OrderMessageListOptions): OrderMessageList!
		orderMessagesByOrder(
			orderId: ID!
			options: OrderMessageListOptions
		): OrderMessageList!
		orderMessage(id: ID!): OrderMessage
		replyMessage(id: ID!): OrderMessage
	}

	extend type Mutation {
		createOrderMessage(input: CreateOrderMessageInput!): OrderMessage!
		markAsRead(id: ID!): OrderMessage!
	}

	input CreateOrderMessageInput {
		orderId: ID!
		subject: String
		message: String
		replyToId: ID!
	}
`;
