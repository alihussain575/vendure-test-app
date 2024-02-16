import { Address } from "@vendure/core";
import {
	EmailDetails,
	EmailGenerator,
	InitializedEmailPluginOptions,
} from "@vendure/email-plugin";
import dateFormat from "dateformat";
import Handlebars from "handlebars";

export class MyEmailGenerator implements EmailGenerator {
	async onInit(options: InitializedEmailPluginOptions) {
		// if (options.templateLoader.loadPartials) {
		// 	const partials = await options.templateLoader.loadPartials();
		// 	partials.forEach(({ name, content }) =>
		// 		Handlebars.registerPartial(name, content)
		// 	);
		// }
		this.registerHelpers();
	}

	generate(
		from: string,
		subject: string,
		templateStr: string,
		templateVars: { [key: string]: any }
	): Pick<EmailDetails<"unserialized">, "from" | "subject" | "body"> {
		const { template, partials, phrases } = JSON.parse(templateStr);

		partials.forEach(({ name, content }: { name: string; content: string }) => {
			console.log(name);

			Handlebars.registerPartial(name, content);
		});

		const templateOptions: RuntimeOptions = {
			allowProtoPropertiesByDefault: true,
		};

		const phrasesResult: Record<string, string> = Object.entries(
			phrases
		).reduce(
			(acc, [key, value]) => ({
				...acc,
				[key]: Handlebars.compile(value)(templateVars, templateOptions),
			}),
			{}
		);

		const compiledFrom = Handlebars.compile(from, { noEscape: true });
		const compiledSubject = Handlebars.compile(subject);
		const compiledTemplate = Handlebars.compile(template);

		const fromResult = compiledFrom(templateVars, templateOptions);
		// const subjectTemplateResult = compiledSubject(
		// 	{...templateVars},
		// 	templateOptions
		// );
		const subjectResult = compiledSubject(
			{ ...templateVars, subject: phrasesResult["subject"] },
			templateOptions
		);

		const body = compiledTemplate(
			{ ...templateVars, ...phrasesResult },
			templateOptions
		);

		return { from: fromResult, subject: subjectResult, body };
	}

	private registerHelpers() {
		Handlebars.registerHelper(
			"formatDate",
			(date: Date | undefined, format: string | object) => {
				if (!date) {
					return date;
				}
				if (typeof format !== "string") {
					format = "default";
				}
				return dateFormat(date, format);
			}
		);

		Handlebars.registerHelper("formatMoney", (amount?: number) => {
			if (amount == null) {
				return amount;
			}
			return (amount / 100).toFixed(2);
		});

		Handlebars.registerHelper(
			"when",
			function (operand_1, operator, operand_2, options) {
				var operators: Record<string, (l: any, r: any) => boolean> = {
					eq: function (l: any, r: any) {
						return l == r;
					},
					noteq: function (l: any, r: any) {
						return l != r;
					},
					gt: function (l: any, r: any) {
						return Number(l) > Number(r);
					},
					gteq: function (l: any, r: any) {
						return Number(l) >= Number(r);
					},
					lt: function (l: any, r: any) {
						return Number(l) < Number(r);
					},
					lteq: function (l: any, r: any) {
						return Number(l) <= Number(r);
					},
					or: function (l: any, r: any) {
						return l || r;
					},
					and: function (l: any, r: any) {
						return l && r;
					},
					"%": function (l: any, r: any) {
						return l % r === 0;
					},
				};

				// console.log(operators);
				// console.log(operator);
				const result = operators[operator](operand_1, operand_2);

				if (result) return options.fn();
				else return options.inverse();
			}
		);

		Handlebars.registerHelper("formatAddress", function (address: Address) {
			const { streetLine1, streetLine2, city, province, postalCode, country } =
				address;
			return `${streetLine1}${streetLine2 ? `, ${streetLine2}` : ""}\n ${city}\n ${province}\n ${postalCode}\n ${country}`;
		});
	}
}
