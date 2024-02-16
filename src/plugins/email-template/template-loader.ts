import { Injector, RequestContext } from "@vendure/core";
import { LoadTemplateInput, TemplateLoader } from "@vendure/email-plugin";
import { EmailTemplateService } from "./services/template.service";

export class CustomEmailTemplateLoader implements TemplateLoader {
	async loadTemplate(
		injector: Injector,
		ctx: RequestContext,
		input: LoadTemplateInput
	): Promise<string> {
		const emailTemplateService = injector.get(EmailTemplateService);

		console.log({ templateName: input.templateName, type: input.type });
		const template = await emailTemplateService.getTemplateByCode(
			ctx,
			input.type
		);

		const partials = await emailTemplateService.getPartial(ctx);

		return JSON.stringify({
			template: template?.template || "",
			partials: partials.map((p) => ({
				name: p.code,
				content: p.template,
			})),
			phrases: template?.phrases.reduce((acc, next) => ({
				...acc,
				[next.key]: next.value,
			}), {}),
		});
	}
}
