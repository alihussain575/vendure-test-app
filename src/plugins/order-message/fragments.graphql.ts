import { gql } from "graphql-tag";

export const ORDER_DETAIL_FRAGMENT = gql`
	fragment OrderDetail on Order {
		id
		code
		customer {
			id
			firstName
			lastName
			emailAddress
		}
		total
		totalWithTax
	}
`;

export const GET_ORDER = gql`
	query GetOrder($id: ID!) {
		order(id: $id) {
			...OrderDetail
		}
	}
`;

export const GET_CUSTOMER = gql`
	query GetCustomer($customerId: ID!) {
		customer(id: $customerId) {
			id
			firstName
			lastName
			emailAddress
			phoneNumber
		}
	}
`;

export const ORDER_MESSAGE_FRAGMENT = gql`
	fragment OrderMessage on OrderMessage {
		id
		createdAt
		updatedAt
		type
		order {
			id
			code
		}
		status
		subject
		to
		from
		message
		createdBy {
			id
			identifier
		}
		toUser {
			id
			identifier
		}
		replyTo {
			id
			subject
		}
	}
`;

export const GET_ALL_ORDER_MESSAGES = gql`
	query GetAllOrderMessages($options: OrderMessageListOptions) {
		allOrderMessages(options: $options) {
			totalItems
			items {
				...OrderMessage
			}
		}
	}
`;

export const GET_ORDER_MESSAGES = gql`
	query getOrderMessages($orderId: ID!, $options: OrderMessageListOptions) {
		getOrderMessages(orderId: $orderId, options: $options) {
			totalItems
			items {
				...OrderMessage
			}
		}
	}
`;

export const GET_ORDER_MESSAGE = gql`
	query getOrderMessage($id: ID!) {
		getOrderMessage(id: $id) {
			...OrderMessage
		}
	}
`;

export const CREATE_ORDER_MESSAGE = gql`
	mutation createOrderMessage($input: CreateOrderMessageInput!) {
		createOrderMessage(input: $input) {
			...OrderMessage
		}
	}
`;

export const UPDATE_ORDER_MESSAGE = gql`
	mutation updateOrderMessage($input: UpdateOrderMessageInput!) {
		updateOrderMessage(input: $input) {
			...OrderMessage
		}
	}
`;

export const DELETE_ORDER_MESSAGE = gql`
	mutation deleteOrderMessage($id: ID!) {
		deleteOrderMessage(id: $id) {
			result
		}
	}
`;

export const DELETE_ORDER_MESSAGES = gql`
	mutation deleteOrderMessages($ids: [ID!]!) {
		deleteOrderMessages(ids: $ids) {
			result
		}
	}
`;

export const MARK_AS_READ = gql`
	mutation markAsRead($id: ID!) {
		markAsRead(id: $id) {
			...OrderMessage
		}
	}
`;
