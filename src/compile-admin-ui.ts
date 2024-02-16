import { compileUiExtensions, setBranding } from "@vendure/ui-devkit/compiler";
import path from "path";
import { CampaignPlugin } from "./plugins/campaign/campaign.plugin";
import { CmsPlugin } from "./plugins/cms/plugin";
import { EmailTemplatePlugin } from "./plugins/email-template/plugin";
import { OrderMessagePlugin } from "./plugins/order-message/order-message.plugin";
import { UpSalePlugin } from "./plugins/upsale/upsale-plugin";
import { OrderExportPlugin } from "./plugins/vendure-plugin-order-export";
import { ProductVariantAppearancePlugin } from "./plugins/product-variant-appearance/plugin";
import { ProductTypesPlugin } from "./plugins/product-types/plugin";

if (require.main === module) {
	// Called directly from command line
	// console.log("extit require.main === module -----------------------------------");
	customAdminUi({ recompile: true, devMode: false })
		.compile?.()
		.then(() => {
			process.exit(0);
		});
}

export function customAdminUi(options: {
	recompile: boolean;
	devMode: boolean;
}) {
	console.log("options", options);
	const compiledAppPath = path.join(__dirname, "../admin-ui");
	console.log("compiledAppPath", compiledAppPath);
	if (options.recompile) {
		// return compileUiExtensions({
		//     outputPath: compiledAppPath,
		//     extensions: [ReviewsPlugin.uiExtensions, nonAngularUiExtensions],
		//     devMode: options.devMode,
		// });
		return compileUiExtensions({
			// load ui from local
			outputPath: compiledAppPath,

			// devMode: options.devMode,
			extensions: [
				// {
				// 	translations: {
				// 		vi: path.join(__dirname, "translations/vi.json"),
				// 	},
				// },
				setBranding({
					//     // The small logo appears in the top left of the screen
					smallLogoPath: path.join(__dirname, "images/logo.webp"),
					//     // The large logo is used on the login page
					largeLogoPath: path.join(__dirname, "images/logo.webp"),
					faviconPath: path.join(__dirname, "images/favicon-32x32.png"),
				}),
				{
					globalStyles: path.join(__dirname, "styles/global.scss"),
				},
				UpSalePlugin.uiExtensions,
				CampaignPlugin.uiExtensions,
				OrderExportPlugin.ui,
				OrderMessagePlugin.uiExtensions,
				EmailTemplatePlugin.uiExtensions,
				CmsPlugin.uiExtensions,
				ProductVariantAppearancePlugin.uiExtensions,
				ProductTypesPlugin.uiExtensions,
			],
			devMode: options.devMode,
		});
	} else {
		return {
			path: path.join(compiledAppPath, "dist"),
			// path: path.join(compiledAppPath, 'src'),
		};
	}
}
