import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import {
	Customer,
	DefaultGuestCheckoutStrategy,
	DefaultJobQueuePlugin,
	DefaultSearchPlugin,
	EntityHydrator,
	LanguageCode,
	VendureConfig,
	dummyPaymentHandler,
} from "@vendure/core";
import { EmailPlugin } from "@vendure/email-plugin";
import "dotenv/config";
import path from "path";
import { customAdminUi } from "./compile-admin-ui";

import { CampaignPlugin } from "./plugins/campaign/campaign.plugin";
import { CmsPlugin } from "./plugins/cms/plugin";
import { SendgridEmailSender } from "./plugins/email-template/email-sender";
import { MyEmailGenerator } from "./plugins/email-template/emailGenerator";
import { EmailTemplatePlugin } from "./plugins/email-template/plugin";
import { CustomEmailTemplateLoader } from "./plugins/email-template/template-loader";
import { orderMessageEvent } from "./plugins/order-message/email-event";
import { OrderMessagePlugin } from "./plugins/order-message/order-message.plugin";
import { ProductVariantAppearancePlugin } from "./plugins/product-variant-appearance/plugin";
import { StripePlugin } from "./plugins/stripe-payment-plugin/stripe.plugin";
import { UpSalePlugin } from "./plugins/upsale/upsale-plugin";
import { OrderExportPlugin } from "./plugins/vendure-plugin-order-export";
import { WishlistPlugin } from "./plugins/vendure-wishlist/wishlist-plugin";
import { ProductTypesPlugin } from "./plugins/product-types/plugin";

const IS_DEV = process.env.APP_ENV === "dev";
const IS_PROD = !IS_DEV; // path.basename(__dirname) === 'dist';
const ASSET_URL = process.env.ASSET_URL || "http://localhost:3000/assets/";

export const config: VendureConfig = {
	apiOptions: {
		port: 3000,
		adminApiPath: "admin-api",
		shopApiPath: "shop-api",
		// The following options are useful in development mode,
		// but are best turned off for production for security
		// reasons.
		...(IS_DEV
			? {
					adminApiPlayground: {
						settings: { "request.credentials": "include" } as any,
					},
					adminApiDebug: true,
					shopApiPlayground: {
						settings: { "request.credentials": "include" } as any,
					},
					shopApiDebug: true,
			  }
			: {}),
	},
	authOptions: {
		tokenMethod: ["bearer", "cookie"],
		superadminCredentials: {
			identifier: process.env.SUPERADMIN_USERNAME,
			password: process.env.SUPERADMIN_PASSWORD,
		},
		cookieOptions: {
			secret: process.env.COOKIE_SECRET,
		},
	},
	dbConnectionOptions: {
		type: "postgres",
		// See the README.md "Migrations" section for an explanation of
		// the `synchronize` and `migrations` options.
		// synchronize: false,
		synchronize:
			(process.env.DB_SYNCHRONIZE || "false") == "true" ? true : false,
		migrations: [path.join(__dirname, "./migrations/*.+(js|ts)")],
		logging: false,
		database: process.env.DB_NAME,
		schema: process.env.DB_SCHEMA,
		host: process.env.DB_HOST,
		port: +process.env.DB_PORT,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		ssl:
			process.env.APP_ENV === "production" && process.env.APP_SSL === "true"
				? true
				: false,
		extra: {
			ssl:
				process.env.APP_ENV === "production" && process.env.APP_SSL === "true"
					? true
					: false,
			rejectUnauthorized: false,
		},
		// subscribers: [OrderSubscriber],
	},
	paymentOptions: {
		paymentMethodHandlers: [dummyPaymentHandler],
	},
	orderOptions: {
		orderItemsLimit: 99,
		// orderCodeStrategy: new OrderCodeStrategy(),
		// process: [customOrderProcess],
		// orderPlacedStrategy: new CustomOrderPlacedStrategy(),
		// orderItemPriceCalculationStrategy: new SurchargeOrderCalculationStrategy(),
		guestCheckoutStrategy: new DefaultGuestCheckoutStrategy({
			allowGuestCheckoutForRegisteredCustomers: true,
		}),
	},
	// shippingOptions: {
	// 	fulfillmentHandlers: [manualFulfillmentHandler, picoFulfillmentHandler],
	// },
	// When adding or altering custom field definitions, the database will
	// need to be updated. See the "Migrations" section in README.md.
	customFields: {
		GlobalSettings: [
			{
				name: "shopUrl",
				type: "string",
				label: [{ languageCode: LanguageCode.en, value: "Shop URL" }],
				defaultValue: "",
			},
		],
	},
	plugins: [
		StripePlugin.init({
			// This prevents different customers from using the same PaymentIntent
			storeCustomersInStripe: true,
			paymentIntentCreateParams: async (injector, ctx, order) => {
				const hydrator = injector.get(EntityHydrator);
				await hydrator.hydrate(ctx, order, { relations: ["customer"] });
				return {
					description: `Order #${order.code} for ${
						order.customer!.emailAddress
					}`,
				};
			},
			customerCreateParams: async (injector, ctx, order) => {
				const entityHydrator = injector.get(EntityHydrator);
				const customer = order.customer as Customer;
				await entityHydrator.hydrate(ctx, customer, {
					relations: ["addresses"],
				});
				const defaultBillingAddress =
					customer.addresses.find((a) => a.defaultBillingAddress) ??
					customer.addresses[0];
				return {
					email: customer.emailAddress,
					name: `${customer.firstName} ${customer.lastName}`,
					address: {
						line1:
							defaultBillingAddress?.streetLine1 ||
							order.shippingAddress?.streetLine1,
						postal_code:
							defaultBillingAddress?.postalCode ||
							order.shippingAddress?.postalCode,
						city: defaultBillingAddress?.city || order.shippingAddress?.city,
						state:
							defaultBillingAddress?.province ||
							order.shippingAddress?.province,
						country:
							defaultBillingAddress?.country.code ||
							order.shippingAddress?.countryCode,
					},
				};
			},
		}),
		AssetServerPlugin.init({
			route: "assets",
			assetUploadDir: path.join(__dirname, "../static/assets"),
			// For local dev, the correct value for assetUrlPrefix should
			// be guessed correctly, but for production it will usually need
			// to be set manually to match your production url.
			assetUrlPrefix: IS_DEV ? undefined : ASSET_URL,
		}),
		DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
		// BullMQJobQueuePlugin.init({
		// 	connection: {
		// 		host: process.env.REDIS_HOST,
		// 		port: +(process.env.REDIS_PORT ?? "6379"),
		// 	}
		// }),
		DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
		// EmailPlugin.init(
		// 	{
		// 	devMode: true,
		// 	outputPath: path.join(__dirname, "../static/email/test-emails"),
		// 	route: "mailbox",
		// 	handlers: defaultEmailHandlers,
		// 	templatePath: path.join(__dirname, "../static/email/templates"),
		// 	globalTemplateVars: {
		// 		// The following variables will change depending on your storefront implementation.
		// 		// Here we are assuming a storefront running at http://localhost:8080.
		// 		fromAddress: '"example" <noreply@example.com>',
		// 		verifyEmailAddressUrl: "http://localhost:8080/verify",
		// 		passwordResetUrl: "http://localhost:8080/password-reset",
		// 		changeEmailAddressUrl:
		// 			"http://localhost:8080/verify-email-address-change",
		// 	},
		// }),
		EmailPlugin.init(
			IS_DEV
				? {
						// devMode: true,
						// outputPath: path.join(__dirname, "../static/email/test-emails"),
						// route: "mailbox",
						handlers: [
							...EmailTemplatePlugin.emailEventHanlders,
							orderMessageEvent,
						],
						// templatePath: path.join(__dirname, "../static/email/templates"),
						globalTemplateVars: {
							// The following variables will change depending on your storefront implementation.
							// Here we are assuming a storefront running at http://localhost:8080.
							fromAddress: `"example" <${process.env.SENDGRID_FROM}>`,
							verifyEmailAddressUrl: "http://localhost:8080/verify",
							passwordResetUrl: "http://localhost:8080/password-reset",
							changeEmailAddressUrl:
								"http://localhost:8080/verify-email-address-change",
						},
						// transport: {
						// 	type: "smtp",
						// 	host: process.env.MAIL_HOST ?? "",
						// 	port: +(process.env.MAIL_PORT ?? "456"),
						// 	auth: {
						// 		user: process.env.MAIL_USERNAME ?? "username",
						// 		pass: process.env.MAIL_PASSWORD ?? "password",
						// 	},
						// 	logging: true,
						// 	debug: IS_DEV,
						// },
						emailGenerator: new MyEmailGenerator(),
						emailSender: new SendgridEmailSender(),
						templateLoader: new CustomEmailTemplateLoader(),
						transport: { type: "none" },
				  }
				: {
						handlers: [
							// ...defaultEmailHandlers,
							...EmailTemplatePlugin.emailEventHanlders,
							orderMessageEvent,
						],
						// templatePath: path.join(__dirname, "../static/email/templates"),
						transport: { type: "none" },
						emailSender: new SendgridEmailSender(),
						globalTemplateVars: {
							fromAddress: `"Waves2cure" <${process.env.SENDGRID_FROM}>`,
							verifyEmailAddressUrl: "https://in.waves2cure.com/verify",
							passwordResetUrl: "https://in.waves2cure.com/password-reset",
							changeEmailAddressUrl:
								"https://in.waves2cure.com/verify-email-address-change",
						},
						emailGenerator: new MyEmailGenerator(),
						templateLoader: new CustomEmailTemplateLoader(),
				  }
		),
		AdminUiPlugin.init({
			route: "admin",
			port: 3002,
			app: customAdminUi({ recompile: !IS_PROD, devMode: !IS_PROD }),
			adminUiConfig: {
				// defaultLanguage: LanguageCode.en,
				// availableLanguages: [LanguageCode.en, LanguageCode.vi],
				brand: "Waves2cure",
				hideVendureBranding: true,
				hideVersion: false,
			},
		}),
		WishlistPlugin,
		UpSalePlugin,
		CampaignPlugin,
		OrderExportPlugin.init({
			exportStrategies: [],
		}),
		OrderMessagePlugin,
		EmailTemplatePlugin,
		CmsPlugin,
		ProductVariantAppearancePlugin,
		ProductTypesPlugin,
	],
};
