import { OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import {
	Channel,
	ChannelEvent,
	EventBus,
	LanguageCode,
	PluginCommonModule,
	VendurePlugin,
} from "@vendure/core";
import { AdminUiExtension } from "@vendure/ui-devkit/compiler";

import { filter } from "rxjs/operators";

import { EmailPlugin } from "@vendure/email-plugin";
import path from "path";
import { adminApiExtensions } from "./api/api-extensions";
import { EmailTemplateAdminResolver } from "./api/email-template-admin.resolver";
import { emailHandlers } from "./emailHandler";
import { TemplatePhrase } from "./entities/template-phrase.entity";
import { EmailTemplate } from "./entities/template.enitty";
import { PdfService } from "./services/pdf.service";
import { TemplatePhraseService } from "./services/template-phrase.service";
import { EmailTemplateService } from "./services/template.service";

@VendurePlugin({
	imports: [PluginCommonModule, EmailPlugin],
	compatibility: "^2.1.0",
	entities: [EmailTemplate, TemplatePhrase],
	providers: [EmailTemplateService, TemplatePhraseService, PdfService],
	adminApiExtensions: {
		schema: adminApiExtensions,
		resolvers: [EmailTemplateAdminResolver],
	},
	configuration: (config) => {
		config.customFields.GlobalSettings.push({
			name: "sendGridToken",
			type: "string",
			label: [{ languageCode: LanguageCode.en, value: "SendGrid Token" }],
			ui: {
				component: "password-form-input",
			},
		});
		config.customFields.GlobalSettings.push({
			name: "sendGridFrom",
			type: "string",
			label: [{ languageCode: LanguageCode.en, value: "SendGrid From" }],
		});

		return config;
	},
})
export class EmailTemplatePlugin
	implements OnApplicationBootstrap, OnModuleInit
{
	static uiExtensions: AdminUiExtension = {
		extensionPath: path.join(__dirname, "ui"),
		providers: ["providers.ts"],
		routes: [{ filePath: "routes.ts", route: "email-templates" }],
	};

	constructor(
		private emailTemplateService: EmailTemplateService,
		private eventBus: EventBus
	) {}

	async onApplicationBootstrap() {
		await this.emailTemplateService.initEmailTemplates();
	}

	static emailEventHanlders = emailHandlers;

	async onModuleInit() {
		this.eventBus
			.ofType(ChannelEvent)
			.pipe(filter((event) => event.type === "created"))
			.subscribe(
				async (event) =>
					await this.emailTemplateService.initChannelTemplate(
						event.ctx,
						event.entity as Channel
					)
			);
	}
}
