import { Query, Mutation, Resolver, Args } from "@nestjs/graphql";
import { Ctx, RequestContext, Transaction } from "@vendure/core";
import { CampaignService } from "../services/campaign.service";

@Resolver()
export class CampaignAdminResolver {
	constructor(private campaignService: CampaignService) {}

	@Query()
	async campaign(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.campaignService.retrieve(ctx, args.id);
	}

	@Query()
	async campaigns(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.campaignService.list(ctx, args.options);
	}

	@Transaction()
	@Mutation()
	async createCampaign(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.campaignService.create(ctx, args.input);
	}

	@Transaction()
	@Mutation()
	async updateCampaign(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.campaignService.update(ctx, args.input);
	}

	// @Transaction()
	// @Mutation()
	// async updateCampaignVariants(@Ctx() ctx: RequestContext, @Args() args: any) {
	// 	return this.campaignService.updateAddonProducts(ctx, args.input);
	// }

	@Transaction()
	@Mutation()
	async deleteCampaign(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.campaignService.delete(ctx, args.id);
	}

	@Transaction()
	@Mutation()
	async deleteCampaigns(@Ctx() ctx: RequestContext, @Args() args: any) {
		return Promise.all(
			args.ids.map((id: string) => this.campaignService.delete(ctx, id))
		);
	}
}
