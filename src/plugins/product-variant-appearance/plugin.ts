import { LanguageCode, PluginCommonModule, VendurePlugin } from "@vendure/core";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";
import path from "path";

@VendurePlugin({
	compatibility: "^2.1.0",
	imports: [PluginCommonModule],
	providers: [],
	configuration: (config) => {
		// config.customFields.Product.push({
		// 	name: "variantAppearance",
		// 	type: "string",
		// 	label: [{ languageCode: LanguageCode.en, value: "Variant Appearance" }],
		// 	defaultValue: "dropdown",
		// 	ui: {
		// 		component: "select-form-input",
		// 		options: [
		// 			{ value: "dropdown", label: "Dropdown" },
		// 			{ value: "rectangle", label: "Rectangle List" },
		// 			{ value: "swatch", label: "Swatch" },
		// 			{ value: "radio", label: "Radio Buttons" },
		// 		],
		// 		defaultValue: "dropdown",
		// 	},
		// });

		config.customFields.ProductOptionGroup.push({
			name: "appearance",
			type: "string",
			label: [{ languageCode: LanguageCode.en, value: "Appearance" }],
			defaultValue: "dropdown",
			ui: {
				component: "select-form-input",
				options: [
					{ value: "dropdown", label: "Dropdown" },
					{ value: "rectangle", label: "Rectangle List" },
					{ value: "swatch", label: "Swatch" },
					{ value: "radio", label: "Radio Buttons" },
				],
				defaultValue: "dropdown",
			},
		});
		config.customFields.ProductOption.push({
			name: "isDefault",
			type: "boolean",
			label: [{ languageCode: LanguageCode.en, value: "Is Default" }],
			defaultValue: false,
			ui: {
				component: "toggle-form-input",
				name: "isDefault",
			},
		});

		return config;
	},
})
export class ProductVariantAppearancePlugin {
	static uiExtensions: AdminUiExtension = {
		extensionPath: path.join(__dirname, "ui"),
		providers: ["providers.ts"],
	};
}
