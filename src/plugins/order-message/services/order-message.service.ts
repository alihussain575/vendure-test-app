import { Injectable } from "@nestjs/common";
import {
	CustomerService,
	EntityNotFoundError,
	EventBus,
	ID,
	ListQueryBuilder,
	ListQueryOptions,
	OrderService,
	RelationPaths,
	RequestContext,
	TransactionalConnection,
	UserService,
	assertFound,
	IllegalOperationError,
} from "@vendure/core";
import { OrderMessage } from "../entities/order-message.entity";
import { OrderMessageEvent } from "../email-event";
import {
	CreateOrderMessageInput,
	DeletionResult,
} from "../ui/generated-admin-types";
import { In } from "typeorm";

@Injectable()
export class OrderMessageService {
	private readonly relations = ["order", "toUser", "createdBy", "replyTo"];

	constructor(
		private connection: TransactionalConnection,
		private orderService: OrderService,
		private listQueryBuilder: ListQueryBuilder,
		private eventBus: EventBus,
		private userService: UserService,
		private customerService: CustomerService
	) {}

	async findOne(ctx: RequestContext, id: ID) {
		return this.connection.getRepository(ctx, OrderMessage).findOne({
			where: { id },
			relations: ["order", "toUser", "createdBy", "replyTo"],
		});
	}

	async findAll(
		ctx: RequestContext,
		options?: ListQueryOptions<OrderMessage>,
		relations?: RelationPaths<OrderMessage>
	) {
		return this.listQueryBuilder
			.build(OrderMessage, options, {
				relations: relations || this.relations,
				ctx,
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({ items, totalItems }));
	}

	async findByOrder(
		ctx: RequestContext,
		orderId: ID,
		options?: ListQueryOptions<OrderMessage>,
		relations?: RelationPaths<OrderMessage>
	) {
		return this.listQueryBuilder
			.build(OrderMessage, options, {
				relations: relations || this.relations,
				ctx,
				where: { order: { id: orderId } },
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({ items, totalItems }));
	}

	async findByActiveUser(
		ctx: RequestContext,
		options?: ListQueryOptions<OrderMessage>
	) {
		if (!ctx.activeUserId) return new Error(`No active user found`);

		const user = await this.userService.getUserById(ctx, ctx.activeUserId);

		if (!user) {
			return new Error(`User with id ${ctx.activeUserId} not found`);
		}

		return this.listQueryBuilder
			.build(OrderMessage, options, {
				relations: this.relations,
				ctx,
				where: {
					toUser: { id: user.id },
				},
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({ items, totalItems }));
	}

	async findByCustomer(
		ctx: RequestContext,
		customerId: ID,
		options?: ListQueryOptions<OrderMessage>,
		relations?: RelationPaths<OrderMessage>
	) {
		const customer = await this.customerService.findOne(ctx, customerId, [
			"user",
		]);

		if (!customer) {
			return new Error(`Customer with id ${customerId} not found`);
		}

		if (!customer.user)
			return new IllegalOperationError(
				`No user found for customer ${customerId}`,
				{ customerId }
			);

		return this.listQueryBuilder
			.build(OrderMessage, options, {
				relations: relations || this.relations,
				ctx,
				where: {
					toUser: { id: customer.user?.id },
				},
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({ items, totalItems }));
	}

	async findOneByReply(ctx: RequestContext, id: ID) {
		return this.connection.getRepository(ctx, OrderMessage).findOne({
			where: { replyTo: { id }, status: In([1, 2]) },
			relations: ["order", "toUser", "createdBy", "replyTo"],
		});
	}

	async replyMessage(ctx: RequestContext, input: CreateOrderMessageInput) {
		if (!input.replyToId) return new Error(`No replyToId provided`);

		const message = await this.findOne(ctx, input.replyToId);

		if (!message) {
			return new Error(`OrderMessage with id ${input.replyToId} not found`);
		}

		if (!message.order) {
			return new Error(`Message has no order`);
		}

		const reply = await this.connection
			.getRepository(ctx, OrderMessage)
			.insert({
				type: input.type || "email",
				subject: input.subject,
				message: input.message,
				order: { id: message.order.id },
				createdBy: { id: ctx.activeUserId },
				toUser: { id: message.createdBy.id },
				from: message.to,
				to: message.from,
				replyTo: { id: message.id },
				status: 1,
			});

		return assertFound(this.findOne(ctx, reply.identifiers[0].id));
	}

	async create(ctx: RequestContext, input: CreateOrderMessageInput) {
		const order = await this.orderService.findOne(ctx, input.orderId);

		if (!order) {
			return new Error(`Order with id ${input.orderId} not found`);
		}

		if (!order.customer || !order.customer.emailAddress) {
			return new Error(`Order with id ${input.orderId} has no customer`);
		}

		if (!input.type) {
			input.type = "email";
		}

		const newOrderMessage = await this.connection
			.getRepository(ctx, OrderMessage)
			.save({
				...input,
				order,
				createdBy: { id: ctx.activeUserId },
				toUser: { id: order.customer.user?.id },
			});

		if (newOrderMessage.type === "email") {
			this.eventBus.publish(new OrderMessageEvent(ctx, newOrderMessage));
		}

		return assertFound(this.findOne(ctx, newOrderMessage.id));
	}

	async markAsRead(ctx: RequestContext, id: ID) {
		const message = await this.findOne(ctx, id);

		if (!message) {
			return new Error(`OrderMessage with id ${id} not found`);
		}

		await this.connection
			.getRepository(ctx, OrderMessage)
			.update({ id }, { status: 2 });

		return assertFound(this.findOne(ctx, id));
	}

	async update(ctx: RequestContext, input: any) {
		const orderMessage = await this.findOne(ctx, input.id);

		if (!orderMessage) {
			return new Error(`OrderMessage with id ${input.id} not found`);
		}

		return this.connection
			.getRepository(ctx, OrderMessage)
			.save({ ...orderMessage, ...input });
	}

	async delete(ctx: RequestContext, id: ID) {
		const orderMessage = await this.findOne(ctx, id);

		if (!orderMessage) {
			return new Error(`OrderMessage with id ${id} not found`);
		}

		await this.connection.getRepository(ctx, OrderMessage).delete(id);

		return {
			result: DeletionResult.DELETED,
		};
	}
}
