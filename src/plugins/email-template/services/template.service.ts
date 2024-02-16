import { Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import {
	Channel,
	GlobalSettingsService,
	Injector,
	JobQueue,
	JobQueueService,
	Logger,
	Order,
	OrderService,
	Product,
	RequestContext,
	RequestContextCacheService,
	TransactionalConnection,
	assertFound,
} from "@vendure/core";
import fs from "fs";
import path from "path";
import { IsNull } from "typeorm";
import { EmailTemplate } from "../entities/template.enitty";

import {
	IntermediateEmailDetails,
	transformOrderLineAssetUrls,
} from "@vendure/email-plugin";
import { serializeAttachments } from "@vendure/email-plugin/lib/src/attachment-utils";
import { EmailProcessor } from "@vendure/email-plugin/lib/src/email-processor";
import { TemplatePhrase } from "../entities/template-phrase.entity";
import {
	OrderType,
	SendTestEmailInput,
	TemplatePhraseInput,
	UpdateEmailTemplateInput,
} from "../ui/generated-admin-types";
import { PdfService } from "./pdf.service";
import templates from "./templates.json";

@Injectable()
export class EmailTemplateService implements OnModuleInit {
	private readonly relations = ["phrases"];

	private jobQueue: JobQueue<IntermediateEmailDetails> | undefined;

	constructor(
		private connection: TransactionalConnection,
		private requestCache: RequestContextCacheService,
		private jobQueueService: JobQueueService,
		private emailProcessor: EmailProcessor,
		private moduleRef: ModuleRef,
		private settingsService: GlobalSettingsService,
		private orderService: OrderService,
		private pdfService: PdfService
	) {}

	async onModuleInit() {
		this.jobQueue = await this.jobQueueService.createQueue({
			name: "send-email",
			process: async (job) => {
				const { data } = job;
				this.emailProcessor.process(data);
			},
		});
	}

	async initEmailTemplates() {
		const channels = await this.connection.rawConnection
			.getRepository(Channel)
			.find();

		for (let channel of channels) {
			try {
				const results = await this.connection.rawConnection
					.getRepository(EmailTemplate)
					.find({
						where: { channelId: channel.id },
					});

				console.log({ channel: channel.code, result: results.length });
				if (results.length === 0) {
					throw new Error(
						"No email templates found in channel: " + channel.code
					);
				}

				// if (results.length === templates.length) {
				await this.updateTemplatesPhrases(results);
				continue;
				// }
			} catch (err) {
				console.log(err);
				for (let template of templates) {
					const templateFile = path.join(
						process.cwd(),
						"static/email/default-templates",
						template.templatePath
					);

					const body = fs.readFileSync(templateFile, "utf8");

					const savedTemplate = await this.connection.rawConnection
						.getRepository(EmailTemplate)
						.save({
							...template,
							enabled: true,
							template: body,
							channelId: channel.id,
						});

					await this.createTemplateDefaultPhrases(savedTemplate);

					// await this.updateTemplateJob.add({
					// 	templateId: newTemplate.id.toString(),
					// 	ctx: RequestContext.empty().serialize(),
					// });
				}
			}
		}
	}

	private async createTemplateDefaultPhrases(template: EmailTemplate) {
		const subject = template.subject;

		const phrase = new TemplatePhrase({
			key: "subject",
			value: subject,
		});

		phrase.template = template;

		await this.connection.rawConnection
			.getRepository(TemplatePhrase)
			.save(phrase);
	}

	private async updateTemplatesPhrases(templates: EmailTemplate[]) {
		for (let template of templates) {
			const phrases = await this.connection.rawConnection
				.getRepository(TemplatePhrase)
				.find({
					where: { template: { id: template.id } },
				});

			// console.log({
			// 	template: template.code,
			// 	phrases: phrases.length,
			// });

			if (phrases.length === 0 && template.type !== "partials") {
				await this.createTemplateDefaultPhrases(template);
			}
		}
	}

	async getTemplates(ctx: RequestContext) {
		const templates = await this.requestCache.get(ctx, "emailTemplate", () =>
			this.connection
				.getRepository(ctx, EmailTemplate)
				.createQueryBuilder("email_template")
				.where("email_template.channelId = :channelId", {
					channelId: ctx.channelId,
				})
				.orderBy(
					this.connection.rawConnection.driver.escape("createdAt"),
					"ASC"
				)
				.getMany()
		);

		return templates;
	}

	async updateTemplate(ctx: RequestContext, input: UpdateEmailTemplateInput) {
		const template = await this.getTemplate(ctx, input.id.toString());

		if (!template) {
			throw new Error(`Template with id ${input.id} not found`);
		}

		template.template = input.template ?? template.template;
		template.enabled = input.enabled ?? template.enabled;

		template.attachFile = input.attachFile ?? template.attachFile;

		if (input.phrases && input.phrases.length > 0) {
			// find deleted phrases in input
			const phrases = template.phrases;
			const phrasesInput = input.phrases;
			const deletedPhrases = phrases.filter(
				(phrase) => !phrasesInput.some((p) => p.key === phrase.key)
			);

			// delete phrases
			for (let phrase of deletedPhrases) {
				await this.connection.getRepository(ctx, TemplatePhrase).remove(phrase);
			}

			const newPhrases = await this.updateTemplatePhrase(
				ctx,
				template,
				phrasesInput
			);

			template.phrases = newPhrases;
		}

		await this.connection.getRepository(ctx, EmailTemplate).save(template);

		return assertFound(this.getTemplate(ctx, input.id.toString()));
	}

	private async updateTemplatePhrase(
		ctx: RequestContext,
		template: EmailTemplate,
		phrase: TemplatePhraseInput[]
	) {
		const phrases = template.phrases;

		const result = [];

		for (let phraseInput of phrase) {
			const phraseFound = phrases.find((p) => p.key === phraseInput.key);

			if (phraseFound) {
				phraseFound.value = phraseInput.value;
				const updated = await this.connection
					.getRepository(ctx, TemplatePhrase)
					.save(phraseFound);
				result.push(updated);
			} else {
				const newPhrase = new TemplatePhrase(phraseInput);
				newPhrase.template = template;
				await this.connection
					.getRepository(ctx, TemplatePhrase)
					.save(newPhrase);

				result.push(newPhrase);
			}
		}

		return result;
	}

	async getTemplate(ctx: RequestContext, id: string) {
		const template = await this.connection
			.getRepository(ctx, EmailTemplate)
			.findOne({
				where: { id, channelId: ctx.channelId },
				relations: this.relations,
			});

		if (!template) {
			throw new Error("Template not found");
		}

		return template;
	}

	async getTemplateByCode(ctx: RequestContext, code: string) {
		const template = await this.connection
			.getRepository(ctx, EmailTemplate)
			.findOne({
				where: { code, channelId: ctx.channelId },
				relations: this.relations,
			});

		return template;
	}

	async resetDefaultTemplate(ctx: RequestContext, code: string) {
		const template = await this.getTemplateByCode(ctx, code);

		if (!template) {
			throw new Error("Template not found");
		}

		const defaultTemplateFile = path.join(
			process.cwd(),
			"static/email/default-templates",
			template.templatePath
		);

		const body = fs.readFileSync(defaultTemplateFile, "utf8");

		return this.updateTemplate(ctx, {
			id: template.id.toString(),
			template: body,
		});
	}

	async getByType(ctx: RequestContext, type: string) {
		const templates = await this.connection
			.getRepository(ctx, EmailTemplate)
			.find({ where: { type, channelId: ctx.channelId } });

		return templates;
	}

	async getPartial(ctx: RequestContext) {
		return this.getByType(ctx, "partials");
	}

	async initChannelTemplate(ctx: RequestContext, channel: Channel) {
		Logger.info(`init emailtemplate for channel ${channel.code}`);
		for (let template of templates) {
			const templateFile = path.join(
				process.cwd(),
				"static/email/default-templates",
				template.templatePath
			);

			const body = fs.readFileSync(templateFile, "utf8");

			await this.connection.getRepository(ctx, EmailTemplate).save({
				...template,
				enabled: true,
				template: body,
				channelId: channel.id,
				attachFile: false,
			});
		}
	}

	private _mockOrder: any = {
		id: "26",
		createdAt: new Date("2023-12-07T23:53:45.853Z"),
		updatedAt: new Date("2023-12-07T23:53:54.877Z"),
		type: OrderType.Regular,
		aggregateOrder: undefined,
		sellerOrders: [],
		code: "C4ZQ94C9REQ9VKQT",
		state: "PaymentSettled",
		nextStates: [
			"PartiallyDelivered",
			"Delivered",
			"PartiallyShipped",
			"Shipped",
			"Cancelled",
			"Modifying",
			"ArrangingAdditionalPayment",
		],
		active: false,
		couponCodes: [],
		customer: {
			id: "1",
			firstName: "vy",
			lastName: "nguyen",
			deletedAt: null,
			title: "",
			phoneNumber: "",
			emailAddress: "",
			// Add other required properties here
		},
		lines: [
			{
				id: "269",
				featuredAsset: {
					preview:
						"http://localhost:3000/assets/preview/0e/gift-wrap__preview.png",
				},
				productVariant: {
					id: "5",
					name: "gift red",
					sku: "red",
					trackInventory: "INHERIT",
					stockOnHand: 100,
					__typename: "ProductVariant",
				},
				discounts: [],
				fulfillmentLines: [],
				unitPrice: 455,
				unitPriceWithTax: 500,
				proratedUnitPrice: 455,
				proratedUnitPriceWithTax: 500,
				quantity: 1,
				orderPlacedQuantity: 1,
				linePrice: 455,
				lineTax: 45,
				linePriceWithTax: 500,
				discountedLinePrice: 455,
				discountedLinePriceWithTax: 500,
				customFields: {
					mainProduct: null,
					mainProductName: "",
					__typename: "OrderLineCustomFields",
				},
				__typename: "OrderLine",
			},
		],
		surcharges: [],
		discounts: [],
		promotions: [],
		subTotal: 455,
		subTotalWithTax: 500,
		total: 455,
		totalWithTax: 500,
		currencyCode: "USD",
		shipping: 0,
		shippingWithTax: 0,
		shippingLines: [
			{
				shippingMethod: {
					id: "1",
					code: "free",
					name: "free",
					fulfillmentHandlerCode: "manual-fulfillment",
					description: "",
					__typename: "ShippingMethod",
				},
				__typename: "ShippingLine",
			},
		],
		taxSummary: [
			{
				description: "vat 10",
				taxBase: 455,
				taxRate: 10,
				taxTotal: 45,
				__typename: "OrderTaxSummary",
			},
			{
				description: "shipping tax",
				taxBase: 0,
				taxRate: 0,
				taxTotal: 0,
				__typename: "OrderTaxSummary",
			},
		],
		shippingAddress: {
			fullName: null,
			company: null,
			streetLine1: null,
			streetLine2: null,
			city: null,
			province: null,
			postalCode: null,
			country: null,
			countryCode: null,
			phoneNumber: null,
			__typename: "OrderAddress",
		},
		billingAddress: {
			fullName: null,
			company: null,
			streetLine1: null,
			streetLine2: null,
			city: null,
			province: null,
			postalCode: null,
			country: null,
			countryCode: null,
			phoneNumber: null,
			__typename: "OrderAddress",
		},
		payments: [
			{
				id: "12",
				createdAt: "2023-12-07T23:54:02.825Z",
				transactionId: "asdf",
				amount: 500,
				method: "cash",
				state: "Settled",
				nextStates: ["Cancelled"],
				errorMessage: null,
				metadata: {},
				refunds: [],
				__typename: "Payment",
			},
		],
		fulfillments: [],
		modifications: [],
		__typename: "Order",
	};

	private _mockUser: any = {
		emailAddress: "",
		firstName: "Test",
		lastName: "Test",
	};

	async sendTestEmail(ctx: RequestContext, input: SendTestEmailInput) {
		let order = this._mockOrder;
		order.customer.emailAddress = input.to;

		const orders = await this.connection.getRepository(ctx, Order).find({
			relations: ["lines", "lines.productVariant", "lines.featuredAsset"],
			take: 1,
			order: {
				createdAt: "ASC",
			},
			where: { state: "PaymentSettled" },
		});

		if (orders.length > 0) {
			order = orders[0];
		} else {
			const products = await this.connection.getRepository(ctx, Product).find({
				relations: ["featuredAsset", "variants", "variants.featuredAsset"],
				take: 1,
				order: {
					createdAt: "ASC",
				},
				where: { deletedAt: IsNull() },
			});

			// console.log(products);
			// console.log(products[0].variants[0]);

			const firstProduct = products[0];
			const variant = firstProduct.variants[0];

			order.lines = [];
			order.lines.push({
				id: "269",
				featuredAsset: {
					preview:
						variant.featuredAsset?.preview ||
						firstProduct.featuredAsset.preview,
				},

				productVariant: {
					...variant,
					// id: "5",
					// name: "gift red",
					// sku: "red",
					// trackInventory: "INHERIT",
					stockOnHand: 100,
					__typename: "ProductVariant",
				},
				discounts: [],
				fulfillmentLines: [],
				unitPrice: variant.price,
				unitPriceWithTax: variant.priceWithTax,
				proratedUnitPrice: variant.price,
				proratedUnitPriceWithTax: variant.priceWithTax,
				quantity: 1,
				orderPlacedQuantity: 1,
				linePrice: variant.price,
				lineTax: variant.priceWithTax - variant.price,
				linePriceWithTax: variant.priceWithTax,
				discountedLinePrice: variant.price,
				discountedLinePriceWithTax: variant.priceWithTax,
				customFields: {
					mainProduct: null,
					mainProductName: "",
					__typename: "OrderLineCustomFields",
				},
				__typename: "OrderLine",
			});

			// recalculate order subtotal & total
			order.subTotal = variant.price;
			order.subTotalWithTax = variant.priceWithTax;
			order.total = variant.price;
			order.totalWithTax = variant.priceWithTax;
		}

		let user = this._mockUser;
		user.emailAddress = input.to;

		const injector = new Injector(this.moduleRef);

		transformOrderLineAssetUrls(ctx, order, injector);

		const settings = await this.settingsService.getSettings(ctx);
		const shopUrl = settings.customFields.shopUrl;

		const template = await this.getTemplateByCode(ctx, input.template);
		let attachments: any[] = [];
		if (template?.attachFile) {
			const filename = `${order.code}.pdf`;
			const content = await this.pdfService.generateInvoiceHtml(order);
			const filepath = await this.pdfService.generatePDFfromHTML(
				content,
				filename
			);
			// console.log(contentBuffer);
			attachments = [
				{
					filename,
					path: filepath,
				},
			];
		}

		// console.log(attachments);

		const data = {
			ctx: ctx.serialize(),
			type: input.template,
			from: "{{ fromAddress }}",
			recipient: input.to,
			templateVars: {
				order,
				user,
				shop_url: shopUrl,
			},
			subject: "{{ subject }}",
			templateFile: "body.hbs",
			attachments: await serializeAttachments(attachments),
		};

		if (this.jobQueue) this.jobQueue.add(data);

		return true;
	}
}
