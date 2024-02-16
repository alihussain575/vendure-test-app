import SgMail from "@sendgrid/mail";
import {
	GlobalSettingsService,
	Injector,
	RequestContextService,
} from "@vendure/core";
import { EmailDetails, EmailSender } from "@vendure/email-plugin";
import fs from "fs";

export class SendgridEmailSender implements EmailSender {
	private sgMail = SgMail;
	private sendGridFrom: string = process.env.SENDGRID_FROM || "";

	async init(injector: Injector) {
		const globalSettingsService = injector.get(GlobalSettingsService);
		const reqContextService = injector.get(RequestContextService);

		const ctx = await reqContextService.create({
			apiType: "admin",
		});

		const settings = await globalSettingsService.getSettings(ctx);

		this.sgMail.setApiKey(settings.customFields.sendGridToken);
		this.sendGridFrom = settings.customFields.sendGridFrom;
	}
	async send(email: EmailDetails) {
		// console.log(email.attachments);
		const attachments = email.attachments.map((attachment) => {
			// console.log(attachment.content);
			const fileContent = attachment.path
				? fs.readFileSync(attachment.path.toString())
				: Buffer.from((attachment.content as string) ?? "");
			return {
				filename: attachment.filename,
				content: fileContent.toString("base64"),
				type: attachment.contentType,
				disposition: "attachment",
			};
		}) as any[];

		await this.sgMail
			.send({
				to: email.recipient,
				from: this.sendGridFrom,
				subject: email.subject,
				html: email.body,
				attachments,
			})
			.catch((error: any) => {
				if (error.response?.body) {
					console.log("error while sending email");
					console.error(error.response.body.errors);
				} else if (error.response) {
					console.log("error while sending email");
					console.error(error.response);
				} else {
					console.log(error);
				}
			});
	}
}
