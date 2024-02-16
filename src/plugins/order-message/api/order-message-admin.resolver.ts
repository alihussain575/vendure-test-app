import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { OrderMessageService } from "../services/order-message.service";
import { RequestContext, Ctx, Transaction } from "@vendure/core";

@Resolver()
export class OrderMessageAdminResolver {
	constructor(private orderMessageService: OrderMessageService) {}

	@Query()
	async allOrderMessages(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.findAll(ctx, args.options);
	}

	@Query()
	async getOrderMessages(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.findByOrder(
			ctx,
			args.orderId,
			args.options
		);
	}

	@Query()
	async getOrderMessage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.findOne(ctx, args.id);
	}

	@Mutation()
	@Transaction()
	async createOrderMessage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.create(ctx, args.input);
	}

	@Mutation()
	@Transaction()
	async updateOrderMessage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.update(ctx, args.input);
	}

	@Mutation()
	@Transaction()
	async deleteOrderMessage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.delete(ctx, args.id);
	}

	@Mutation()
	@Transaction()
	async deleteOrderMessages(@Ctx() ctx: RequestContext, @Args() args: any) {
		return Promise.all([
			...args.ids.map((id: string) => this.orderMessageService.delete(ctx, id)),
		]);
	}

	@Mutation()
	@Transaction()
	async markAsRead(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.markAsRead(ctx, args.id);
	}
}
