import { PluginCommonModule, VendurePlugin } from "@vendure/core";
import { CustomerWishlist } from "./entities/customer-wishlist.entity";
import { adminApiExtensions, shopApiExtensions } from "./api/api-extensions";
import { WishlistStoreResolver } from "./api/wishlist-store.resolver";
import { WishlistService } from "./services/wishlist.service";

@VendurePlugin({
	imports: [PluginCommonModule],
	compatibility: "^2.0.6",
	entities: [CustomerWishlist],
	adminApiExtensions: {
		schema: adminApiExtensions,
		resolvers: [],
	},
	shopApiExtensions: {
		schema: shopApiExtensions,
		resolvers: [WishlistStoreResolver],
	},
	providers: [WishlistService],
})
export class WishlistPlugin {}
