import { Resolver, Query, Args } from "@nestjs/graphql";
import { Ctx, RequestContext } from "@vendure/core";
import { CmsService } from "../services/cms.service";

@Resolver()
export class CmsShopResolver {
  constructor(private cmsService: CmsService) {}

  @Query()
  async pages(@Ctx() ctx: RequestContext, @Args() args: any) {
    return this.cmsService.getPages(ctx, args.options);
  }

  @Query()
  async pageBySlug(@Ctx() ctx: RequestContext, @Args() args: any) {
    return this.cmsService.getPageBySlug(ctx, args.slug);
  }
}
