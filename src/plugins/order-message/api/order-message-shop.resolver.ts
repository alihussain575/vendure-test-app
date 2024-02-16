import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { OrderMessageService } from "../services/order-message.service";
import { RequestContext, Ctx, Transaction } from "@vendure/core";

@Resolver()
export class OrderMessageShopResolver {
	constructor(private orderMessageService: OrderMessageService) {}

	@Query()
	async orderMessages(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.findByActiveUser(ctx, args.options);
	}

	@Query()
	async orderMessagesByOrder(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.findByOrder(
			ctx,
			args.orderId,
			args.options
		);
	}

	@Query()
	async orderMessage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.findOne(ctx, args.id);
	}

	@Query()
	async replyMessage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.findOneByReply(ctx, args.id);
	}

	@Mutation()
	@Transaction()
	async createOrderMessage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.replyMessage(ctx, args.input);
	}

	@Mutation()
	@Transaction()
	async markAsRead(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.orderMessageService.markAsRead(ctx, args.id);
	}
}
