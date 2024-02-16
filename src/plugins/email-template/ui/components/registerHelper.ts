import dateFormat from "dateformat";
import { Address } from "../generated-admin-types";

export function registerHelpers(
	Handlebars: typeof import("handlebars"),
	partials: any[]
) {
	console.log(partials)
	partials.forEach(({ name, content }: { name: string; content: string }) =>
		Handlebars.registerPartial(name, content)
	);

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
		function (operand_1: any, operator: string, operand_2: any, options: any) {
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
