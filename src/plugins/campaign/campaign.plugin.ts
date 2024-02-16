import { OnModuleInit } from "@nestjs/common";

import {
	EventBus,
	PluginCommonModule,
	ProductEvent,
	ProductVariantEvent,
	VendurePlugin,
} from "@vendure/core";
import { CampaignService } from "./services/campaign.service";
import { adminApiExtensions, shopApiExtensions } from "./api/api-extensions";
import { CampaignAdminResolver } from "./api/campaign-admin.resolver";
import { CampaignShopResolver } from "./api/campaign-shop.resolver";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";
import path from "path";
import { Campaign } from "./entities/campaign.entity";

@VendurePlugin({
	imports: [PluginCommonModule],
	compatibility: "^2.0.6",
	entities: [Campaign],
	adminApiExtensions: {
		schema: adminApiExtensions,
		resolvers: [CampaignAdminResolver],
	},
	shopApiExtensions: {
		schema: shopApiExtensions,
		resolvers: [CampaignShopResolver],
	},
	providers: [CampaignService],
})
export class CampaignPlugin implements OnModuleInit {
	static uiExtensions: AdminUiExtension = {
		extensionPath: path.join(__dirname, "ui"),
		ngModules: [
			{
				type: "lazy",
				route: "campaign",
				ngModuleName: "CampaignLazyModule",
				ngModuleFileName: "campaign-lazy.module.ts",
			},
			{
				type: "shared",
				ngModuleName: "CampaignSharedModule",
				ngModuleFileName: "campaign-shared.module.ts",
			},
		],
	};

	constructor(
		private eventBus: EventBus,
		private campaignService: CampaignService
	) {}

	onModuleInit() {
		this.eventBus
			.filter(
				(event) =>
					event instanceof ProductEvent || event instanceof ProductVariantEvent
			)
			.subscribe((event) => {
				if (event instanceof ProductEvent) {
					this.campaignService.handleProductEvent(
						event.ctx,
						event.type,
						event.entity
					);
				}

				if (event instanceof ProductVariantEvent) {
					this.campaignService.handleVariantEvent(
						event.ctx,
						event.type,
						event.entity
					);
				}
			});
	}
}
