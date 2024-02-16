import { PluginCommonModule, VendurePlugin } from "@vendure/core";

import { OrderMessageService } from "./services/order-message.service";
import { OrderMessage } from "./entities/order-message.entity";
import { adminApiExtensions, shopApiExtentions } from "./api/api-extensions";
import { OrderMessageAdminResolver } from "./api/order-message-admin.resolver";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";

import path from "path";
import { OrderMessageShopResolver } from "./api/order-message-shop.resolver";

@VendurePlugin({
	compatibility: "^2.0.6",
	imports: [PluginCommonModule],
	providers: [OrderMessageService],
	entities: [OrderMessage],
	adminApiExtensions: {
		schema: adminApiExtensions,
		resolvers: [OrderMessageAdminResolver],
	},
	shopApiExtensions: {
		schema: shopApiExtentions,
		resolvers: [OrderMessageShopResolver],
	},
})
export class OrderMessagePlugin {
	static uiExtensions: AdminUiExtension = {
		id: "order-message",
		extensionPath: path.join(__dirname, "ui"),
		ngModules: [
			{
				type: "shared",
				ngModuleFileName: "order-message-shared.module.ts",
				ngModuleName: "OrderMessageSharedModule",
			},
			{
				type: "lazy",
				route: "unread-messages",
				ngModuleFileName: "order-message.module.ts",
				ngModuleName: "OrderMessageModule",
			},
		],
	};
}
