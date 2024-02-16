import {
	AccountRegistrationEvent,
	FulfillmentStateTransitionEvent,
	GlobalSettingsService,
	OrderLineEvent,
	OrderService,
	OrderStateTransitionEvent,
	PasswordResetEvent,
	PaymentStateTransitionEvent,
	RefundStateTransitionEvent,
} from "@vendure/core";
import {
	EmailEventHandler,
	EmailEventListener,
	hydrateShippingLines,
	transformOrderLineAssetUrls,
} from "@vendure/email-plugin";
import { PdfService } from "./services/pdf.service";
import { EmailTemplateService } from "./services/template.service";

const orderConfirmationEmail = new EmailEventListener("order-confirmation")
	.on(OrderStateTransitionEvent)
	.filter(
		(event) =>
			event.toState === "PaymentSettled" &&
			event.fromState !== "Modifying" &&
			!!event.order.customer
	)
	.loadData(async ({ event, injector }) => {
		console.log("start loadData");
		transformOrderLineAssetUrls(event.ctx, event.order, injector);
		const shippingLines = await hydrateShippingLines(
			event.ctx,
			event.order,
			injector
		);

		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"order-confirmation"
		);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		let filename = `${event.order.code}.pdf`;
		let content = "";
		let contentBuffer = Buffer.from("");
		let filepath = "";
		if (template && template.attachFile) {
			const pdfService = injector.get(PdfService);
			content = await pdfService.generateInvoiceHtml(event.order);
			filepath = await pdfService.generatePDFfromHTML(content, filename);
			// contentBuffer = await pdfService.readFile(filepath);
		}

		// console.log({ template });

		return {
			shippingLines,
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
			filename,
			content,
			filepath,
		};
	})
	.setAttachments(async (event) => {
		// console.log(event.data.template);

		const { filename, filepath } = event.data;
		return [{ filename, path: filepath }];
	})
	.setRecipient((event) => event.order.customer!.emailAddress)
	.setFrom("{{ fromAddress }}")
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.order,
		shippingLines: event.data.shippingLines,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const orderEditedEmail = new EmailEventListener("order-edited")
	.on(OrderLineEvent)
	.filter(
		(event) =>
			event.type === "updated" &&
			event.order.active === false &&
			!!event.order.customer
	)
	.loadData(async ({ event, injector }) => {
		transformOrderLineAssetUrls(event.ctx, event.order, injector);
		const shippingLines = await hydrateShippingLines(
			event.ctx,
			event.order,
			injector
		);

		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"order-edited"
		);
		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			shippingLines,
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setFrom("{{ fromAddress }}")
	.setRecipient((event) => event.order.customer!.emailAddress)
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.order,
		shippingLines: event.data.shippingLines,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const orderCancelledEmail = new EmailEventListener("order-canceled")
	.on(OrderStateTransitionEvent)
	.filter(
		(event) =>
			event.toState === "Cancelled" &&
			event.fromState !== "Modifying" &&
			!!event.order.customer
	)
	.loadData(async ({ event, injector }) => {
		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"order-canceled"
		);
		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setRecipient((event) => event.order.customer!.emailAddress)
	.setFrom("{{ fromAddress }}")
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const orderRefundEmail = new EmailEventListener("order-refund")
	.on(RefundStateTransitionEvent)
	.filter((event) => event.toState === "Settled" && !!event.order.customer)
	.loadData(async ({ event, injector }) => {
		transformOrderLineAssetUrls(event.ctx, event.order, injector);

		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"order-refund"
		);
		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setRecipient((event) => event.order.customer!.emailAddress)
	.setFrom("{{ fromAddress }}")
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const paymentErrorEmail = new EmailEventListener("payment-error")
	.on(PaymentStateTransitionEvent)
	.filter((event) => event.toState === "Error" && !!event.order.customer)
	.loadData(async ({ event, injector }) => {
		transformOrderLineAssetUrls(event.ctx, event.order, injector);

		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"payment-error"
		);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setRecipient((event) => event.order.customer!.emailAddress)
	.setFrom("{{ fromAddress }}")
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const pendingPaymentErrorEmail = new EmailEventListener("pending-payment-error")
	.on(PaymentStateTransitionEvent)
	.filter((event) => event.toState === "Declined" && !!event.order.customer)
	.loadData(async ({ event, injector }) => {
		transformOrderLineAssetUrls(event.ctx, event.order, injector);

		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"pending-payment-error"
		);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setFrom("{{ fromAddress }}")
	.setRecipient((event) => event.order.customer!.emailAddress)
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const pendingPaymentSuccessEmail = new EmailEventListener(
	"pending-payment-success"
)
	.on(PaymentStateTransitionEvent)
	.filter((event) => event.toState === "Settled" && !!event.order.customer)
	.loadData(async ({ event, injector }) => {
		transformOrderLineAssetUrls(event.ctx, event.order, injector);

		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"pending-payment-success"
		);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setFrom("{{ fromAddress }}")
	.setSubject("{{ subject }}")
	.setRecipient((event) => event.order.customer!.emailAddress)
	.setTemplateVars((event) => ({
		order: event.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const readyForPickupEmail = new EmailEventListener("ready-for-pickup")
	.on(FulfillmentStateTransitionEvent)
	.filter((evt) => evt.toState === "Created")
	.loadData(async ({ event, injector }) => {
		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"ready-for-pickup"
		);

		const orderService = injector.get(OrderService);
		const order = await orderService.findOneByOrderLineId(
			event.ctx,
			event.fulfillment.lines[0].orderLineId
		);
		if (order) transformOrderLineAssetUrls(event.ctx, order, injector);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			order,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.filter((event) => !!event.data?.order?.customer)
	.setFrom("{{ fromAddress }}")
	.setRecipient((event) => event.data.order!.customer!.emailAddress)
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.data.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const pickedupEmail = new EmailEventListener("picked-up")
	.on(FulfillmentStateTransitionEvent)
	.filter((evt) => evt.toState === "Shipped")
	.loadData(async ({ event, injector }) => {
		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"ready-for-pickup"
		);

		const orderService = injector.get(OrderService);
		const order = await orderService.findOneByOrderLineId(
			event.ctx,
			event.fulfillment.lines[0].orderLineId
		);
		if (order) transformOrderLineAssetUrls(event.ctx, order, injector);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			order,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.filter((event) => !!event.data?.order?.customer)
	.setFrom("{{ fromAddress }}")
	.setRecipient((event) => event.data.order!.customer!.emailAddress)
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.data.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const deliveredEmail = new EmailEventListener("delivered")
	.on(FulfillmentStateTransitionEvent)
	.filter((evt) => evt.toState === "Delivered")
	.loadData(async ({ event, injector }) => {
		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"ready-for-pickup"
		);

		const orderService = injector.get(OrderService);
		const order = await orderService.findOneByOrderLineId(
			event.ctx,
			event.fulfillment.lines[0].orderLineId
		);
		if (order) transformOrderLineAssetUrls(event.ctx, order, injector);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			order,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.filter((event) => !!event.data?.order?.customer)
	.setFrom("{{ fromAddress }}")
	.setRecipient((event) => event.data.order!.customer!.emailAddress)
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		order: event.data.order,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const accountCreatedEmail = new EmailEventListener("account-created")
	.on(AccountRegistrationEvent)
	.filter((event) => event.user.identifier.includes("@"))
	.loadData(async ({ event, injector }) => {
		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"account-created"
		);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setRecipient((event) => event.user.identifier)
	.setFrom("{{ fromAddress }}")
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		user: event.user,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

const passwordResetEmail = new EmailEventListener("password-reset")
	.on(PasswordResetEvent)
	.filter((event) => event.user.identifier.includes("@"))
	.loadData(async ({ event, injector }) => {
		const templateService = injector.get(EmailTemplateService);
		const template = await templateService.getTemplateByCode(
			event.ctx,
			"password-reset"
		);

		const settings = await injector
			.get(GlobalSettingsService)
			.getSettings(event.ctx);

		return {
			template,
			subject: template?.subject,
			shop_url: settings.customFields?.shopUrl,
		};
	})
	.setFrom("{{ fromAddress }}")
	.setRecipient((event) => event.user.identifier)
	.setSubject("{{ subject }}")
	.setTemplateVars((event) => ({
		user: event.user,
		subject: event.data.subject,
		shop_url: event.data.shop_url,
	}));

export const emailHandlers: EmailEventHandler<any, any>[] = [
	orderConfirmationEmail,
	orderEditedEmail,
	orderCancelledEmail,
	orderRefundEmail,
	paymentErrorEmail,
	pendingPaymentErrorEmail,
	pendingPaymentSuccessEmail,
	readyForPickupEmail,
	pickedupEmail,
	deliveredEmail,
	accountCreatedEmail,
	passwordResetEmail,
];
