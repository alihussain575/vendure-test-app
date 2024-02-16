import { Args, Query, Resolver, Mutation } from "@nestjs/graphql";
import {
	Allow,
	Ctx,
	Permission,
	RequestContext,
	Transaction,
} from "@vendure/core";
import { WishlistService } from "../services/wishlist.service";

@Resolver()
export class WishlistStoreResolver {
	constructor(private wishlistService: WishlistService) {}

	@Query()
	async wishlist(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.wishlistService.getAllByCustomer(ctx);
	}

	@Transaction()
	@Mutation()
	async addToWishlist(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.wishlistService.addItem(ctx, args.input.productId);
	}

	@Transaction()
	@Mutation()
	async removeWishListItem(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.wishlistService.removeItemByProductVariantId(
			ctx,
			args.productVariantId
		);
	}

	@Query()
	async wishlistItem(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.wishlistService.getByProductVariantId(
			ctx,
			args.productVariantId
		);
	}
}
