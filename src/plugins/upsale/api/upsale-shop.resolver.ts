import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UpsaleService } from "../service/upsale.service";
import { Ctx, RequestContext, Transaction } from "@vendure/core";

@Resolver()
export class UpsaleShopResolver {
	constructor(private upsaleService: UpsaleService) {}

	@Query()
	async listByProduct(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.upsaleService.listByProduct(ctx, args.productVariantId);
	}
}
