import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UpsaleService } from "../service/upsale.service";
import { Ctx, RequestContext, Transaction } from "@vendure/core";

@Resolver()
export class UpsaleAdminResolver {
	constructor(private upsaleService: UpsaleService) {}

	@Query()
	async listByProduct(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.upsaleService.listByProduct(ctx, args.productVariantId);
	}

	@Query()
	async getUpsale(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.upsaleService.getUpsale(ctx, args.id);
	}

	@Transaction()
	@Mutation()
	async addUpsaleToProduct(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.upsaleService.addUpsaleToProduct(ctx, args.input);
	}

	@Transaction()
	@Mutation()
	async updateUpsale(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.upsaleService.updateUpsale(ctx, args.input);
	}

	@Transaction()
	@Mutation()
	async removeUpsale(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.upsaleService.removeUpsale(ctx, args.id);
	}
}

export default UpsaleAdminResolver;
