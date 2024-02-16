import { PluginCommonModule, Type, VendurePlugin } from "@vendure/core";
import path from "path";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";
import {
	OrderExportController,
	OrderExportResolver,
} from "./api/order-export.controller";
import { DefaultExportStrategy, orderExportPermission } from "./index";
import { ExportStrategy } from "./api/export-strategy";
import { PLUGIN_INIT_OPTIONS } from "./constants";

import { adminApiExtensions } from "./api/api-extension";

export interface ExportPluginConfig {
	exportStrategies: ExportStrategy[];
}

@VendurePlugin({
	imports: [PluginCommonModule],
	compatibility: "^2.0.6",
	providers: [
		{
			provide: PLUGIN_INIT_OPTIONS,
			useFactory: () => OrderExportPlugin.config,
		},
	],
	adminApiExtensions: {
		resolvers: [OrderExportResolver],
		schema: adminApiExtensions,
	},
	controllers: [OrderExportController],
	configuration: (config) => {
		config.authOptions.customPermissions.push(orderExportPermission);
		return config;
	},
})
export class OrderExportPlugin {
	static config: ExportPluginConfig;

	static init(config: ExportPluginConfig): Type<OrderExportPlugin> {
		if (!config.exportStrategies?.length) {
			config.exportStrategies.push(new DefaultExportStrategy());
		}
		OrderExportPlugin.config = config;
		return this;
	}

	static ui: AdminUiExtension = {
		id: "order-report",
		extensionPath: path.join(__dirname, "ui"),
		ngModules: [
			{
				type: "shared",
				ngModuleFileName: "order-export-nav.module.ts",
				ngModuleName: "OrderExportNavModule",
			},
			{
				type: "lazy",
				route: "export-orders",
				ngModuleFileName: "order-export.module.ts",
				ngModuleName: "OrderExportModule",
			},
		],
	};
}
