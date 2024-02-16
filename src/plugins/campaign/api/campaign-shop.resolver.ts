import { Query, Mutation, Resolver, Args } from "@nestjs/graphql";
import { Ctx, RequestContext, Transaction } from "@vendure/core";
import { CampaignService } from "../services/campaign.service";

@Resolver()
export class CampaignShopResolver {
	constructor(private campaignService: CampaignService) {}

	@Query()
	async campaign(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.campaignService.retrieveByProduct(ctx, args.productId);
	}
}
