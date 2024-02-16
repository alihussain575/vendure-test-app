import {
	LanguageCode,
	OrderLine,
	PluginCommonModule,
	VendurePlugin,
} from "@vendure/core";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";
import path from "path";
import { UpSale } from "./entities/upsale.entity";
import { adminApiExtensions, shopApiExtensions } from "./api/api-extensions";
import { UpsaleService } from "./service/upsale.service";
import UpsaleAdminResolver from "./api/upsale-admin.resolver";
import { UpsaleShopResolver } from "./api/upsale-shop.resolver";

@VendurePlugin({
	imports: [PluginCommonModule],
	compatibility: "^2.0.6",
	entities: [UpSale],
	adminApiExtensions: {
		schema: adminApiExtensions,
		resolvers: [UpsaleAdminResolver],
	},
	shopApiExtensions: {
		schema: shopApiExtensions,
		resolvers: [UpsaleShopResolver],
	},
	providers: [UpsaleService],
	configuration: (config) => {
		config.customFields.OrderLine.push(
			{
				name: "mainProduct",
				type: "relation",
				label: [{ languageCode: LanguageCode.en, value: "Main Product" }],
				entity: OrderLine,
			},
			{
				name: "mainProductName",
				type: "string",
				label: [{ languageCode: LanguageCode.en, value: "Parent" }],
			}
		);

		// config.customFields.Channel.push(
		// 	{
		// 		name: "header",
		// 		type: "string",
		// 		label: [{ languageCode: LanguageCode.en, value: "Header" }],
		// 	},
		// 	{
		// 		name: "subHeader",
		// 		type: "string",
		// 		label: [{ languageCode: LanguageCode.en, value: "Sub Header" }],
		// 	},
		// 	{
		// 		name: "finishLabel",
		// 		type: "string",
		// 		label: [{ languageCode: LanguageCode.en, value: "Finish Label" }],
		// 	},
		// 	{
		// 		name: "addToCartLabel",
		// 		type: "string",
		// 		label: [{ languageCode: LanguageCode.en, value: "Add To Cart Label" }],
		// 	}
		// );

		config.customFields;

		return config;
	},
})
export class UpSalePlugin {
	static uiExtensions: AdminUiExtension = {
		extensionPath: path.join(__dirname, "ui"),
		ngModules: [
			{
				type: "shared",
				ngModuleName: "UpsaleSharedModule",
				ngModuleFileName: "upsale-shared.module.ts",
			},
		],
	};
}
