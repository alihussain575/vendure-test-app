import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Ctx, RequestContext, Transaction } from "@vendure/core";
import { CmsService } from "../services/cms.service";

@Resolver()
export class CmsAdminResolver {
	constructor(private cmsService: CmsService) {}

	@Query()
	async pages(@Ctx() ctx: RequestContext) {
		return this.cmsService.getPages(ctx);
	}

	@Query()
	async page(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.cmsService.getPage(ctx, args.id);
	}

	@Transaction()
	@Mutation()
	async createPage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.cmsService.createPage(ctx, args.input);
	}

	@Transaction()
	@Mutation()
	async updatePage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.cmsService.updatePage(ctx, args.input);
	}

	@Transaction()
	@Mutation()
	async deletePage(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.cmsService.deletePage(ctx, args.id);
	}

	@Transaction()
	@Mutation()
	async deletePages(@Ctx() ctx: RequestContext, @Args() args: any) {
		return Promise.all(
			args.ids.map((id: string) => this.cmsService.deletePage(ctx, id))
		);
	}
}
