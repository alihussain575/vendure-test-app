import { PluginCommonModule, VendurePlugin } from "@vendure/core";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";
import path from "path";
import { adminApiExtensions, shopApiExtensions } from "./api/api-extentions";
import { CmsAdminResolver } from "./api/cms-admin.resolver";
import { CmsShopResolver } from "./api/cms-shop.resolver";
import { Page } from "./entities/page.entity";
import { CmsService } from "./services/cms.service";

@VendurePlugin({
	compatibility: "^2.1.0",
	imports: [PluginCommonModule],
	providers: [CmsService],
	entities: [Page],
	adminApiExtensions: {
		schema: adminApiExtensions,
		resolvers: [CmsAdminResolver],
	},
	shopApiExtensions: {
		schema: shopApiExtensions,
		resolvers: [CmsShopResolver],
	},
})
export class CmsPlugin {
	static uiExtensions: AdminUiExtension = {
		extensionPath: path.join(__dirname, "ui"),
		providers: ["providers.ts"],
		routes: [{ route: "pages", filePath: "routes.ts" }],
	};
}
