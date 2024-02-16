import { plusIcon, trashIcon } from "@cds/core/icon";
import { NotificationService } from "@vendure/admin-ui/core";
import {
	ActionBar,
	Card,
	CdsIcon,
	PageBlock,
	PageDetailLayout,
	useInjector,
	useMutation,
	usePageMetadata,
	useQuery,
	useRouteParams,
} from "@vendure/admin-ui/react";
import dateFormat from "dateformat";
import Handlebars from "handlebars";
import React, { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
	Address,
	GetEmailTemplateByCodeDocument,
	GetEmailTemplateByCodeQuery,
	GetPartialsDocument,
	ResetDefaultTemplateDocument,
	SendTestEmailDocument,
	UpdateEmailTemplateDocument,
} from "../generated-admin-types";
import Tab from "./tabs";
import TemplateEditor from "./template-editor";

type EmailTemplateDetail = GetEmailTemplateByCodeQuery["emailTemplateByCode"];

type TemplateFormType = {
	enabled: boolean;
	subject: string;
	template: string;
	attachFile: boolean;
	phrases: {
		key: string;
		value: string;
	}[];
};

const mockOrder = {
	id: "26",
	createdAt: "2023-12-07T23:53:45.853Z",
	updatedAt: "2023-12-07T23:53:54.877Z",
	type: "Regular",
	aggregateOrder: null,
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
		__typename: "Customer",
	},
	lines: [
		{
			id: "269",
			featuredAsset: {
				preview:
					"http://localhost:3000/assets/preview/0e/gift-wrap__preview.png",
				__typename: "Asset",
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

const templateOrder = {
	"order.code": "Order code (e.g. #123456)",
	"order.state": "Order state (e.g. PaymentSettled)",
	"order.customer.firstName": "Customer first name",
	"order.customer.lastName": "Customer last name",
	"order.lines[].featuredAsset.preview": "Line product thumbnail image",
	"order.lines[].productVariant.name": "Line product name",
	"order.lines[].productVariant.sku": "Line product sku",
	"order.lines[].linePrice": "Line price",
	"order.lines[].linePriceWithTax": "Line price with tax",
	"order.lines[].unitPrice": "Line unit price",
	"order.lines[].unitPriceWithTax": "Line unit price with tax",
	"order.lines[].quantity": "Line quantity",
	"order.lines[].lineTax": "Line tax",
	"order.lines[].discountedLinePrice": "Line discounted price",
	"order.lines[].discountedLinePriceWithTax": "Line discounted price with tax",
	"order.shipping": "Shipping",
	"order.shippingWithTax": "Shipping with tax",
	"order.shippingLines[].shippingMethod.name": "Shipping method name",
	"order.shippingLines[].shippingMethod.code": "Shipping method code",
	"order.shippingLines[].shippingMethod.description":
		"Shipping method description",
	"order.taxSummary[].description": "Tax summary description",
	"order.taxSummary[].taxBase": "Tax summary base",
	"order.taxSummary[].taxRate": "Tax summary rate",
	"order.taxSummary[].taxTotal": "Tax summary total",
	"order.shippingAddress.fullName": "Shipping address full name",
	"order.shippingAddress.company": "Shipping address company",
	"order.shippingAddress.streetLine1": "Shipping address street line 1",
	"order.shippingAddress.streetLine2": "Shipping address street line 2",
	"order.shippingAddress.city": "Shipping address city",
	"order.shippingAddress.province": "Shipping address province",
	"order.shippingAddress.postalCode": "Shipping address postal code",
	"order.shippingAddress.country": "Shipping address country",
	"order.shippingAddress.countryCode": "Shipping address country code",
	"order.shippingAddress.phoneNumber": "Shipping address phone number",
	"order.billingAddress.fullName": "Billing address full name",
	"order.billingAddress.company": "Billing address company",
	"order.billingAddress.streetLine1": "Billing address street line 1",
	"order.billingAddress.streetLine2": "Billing address street line 2",
	"order.billingAddress.city": "Billing address city",
	"order.billingAddress.province": "Billing address province",
	"order.billingAddress.postalCode": "Billing address postal code",
	"order.billingAddress.country": "Billing address country",
	"order.billingAddress.countryCode": "Billing address country code",
	"order.billingAddress.phoneNumber": "Billing address phone number",
	"order.payment.transactionId": "Payment transaction ID",
	"order.payment.amount": "Payment amount",
	"order.payment.method": "Payment method",
	"order.payment.state": "Payment state",
	"order.payment.errorMessage": "Payment error message",
};

const templateVars: Record<string, any> = {
	order: {
		global: {
			shop_url: "Shop url",
		},
		order: templateOrder,
	},
	shipping: {
		global: {
			shop_url: "Shop url",
		},
		order: templateOrder,
	},
	customer: {
		global: {
			shop_url: "Shop url",
		},
		customer: {
			"customer.reset_password_url": "Reset password url",
		},
	},
};

export default function EmailTemplateDetail() {
	const { params } = useRouteParams();

	const { data, loading, refetch } = useQuery(GetEmailTemplateByCodeDocument, {
		code: params.code,
	});
	const { data: partialData, loading: loadingPartial } =
		useQuery(GetPartialsDocument);
	const partials = partialData?.partials || [];

	useEffect(() => {
		if (loadingPartial || !partialData) {
			return;
		}
	}, [partialData, loadingPartial]);

	const { setBreadcrumb, setTitle } = usePageMetadata();
	useEffect(() => {
		if (loading || !data) {
			return;
		}

		setBreadcrumb([
			{ label: "Email Templates", link: ["/extensions/email-templates"] },
			{ label: data.emailTemplateByCode.name, link: [] },
		]);
		setTitle(data.emailTemplateByCode.name);
	}, [data, loading]);

	const template = data?.emailTemplateByCode;

	const form = useForm<TemplateFormType>({
		defaultValues: getTemplateData(template),
	});

	const { formState, control, register, handleSubmit, reset, watch } = form;

	useEffect(() => {
		if (template && !loading) {
			reset(getTemplateData(template));
		}
	}, [template, loading]);

	const [updateTemplate] = useMutation(UpdateEmailTemplateDocument);
	const onSubmit = handleSubmit(async (data) => {
		// console.log(data);
		if (!template) return;

		await updateTemplate({
			input: {
				id: template.id,
				enabled: data.enabled,
				template: data.template,
				phrases: data.phrases.map((phrase) => ({
					key: phrase.key,
					value: phrase.value,
					templateCode: template.code,
				})),
				attachFile: data.attachFile ?? false,
			},
		});

		await refetch({ code: params.code });
	});

	const [resetDefault] = useMutation(ResetDefaultTemplateDocument);
	const onResetDefault = async () => {
		await resetDefault({
			code: params.code,
		});
		await refetch({ code: params.code });
	};

	const values = watch();
	const bodyToHtml = useMemo(() => {
		registerHelpers(
			partials.map((partial) => ({
				name: partial.code,
				content: partial.template,
			}))
		);

		const { template: body, phrases } = values;

		const compiledPhrases = phrases.reduce((acc, phrase) => {
			acc[phrase.key] = Handlebars.compile(phrase.value)({ order: mockOrder });
			return acc;
		}, {} as Record<string, string>);

		try {
			return Handlebars.compile(body)({ order: mockOrder, ...compiledPhrases });
		} catch (error: any) {
			// console.log(error);
			return error.message;
		}
	}, [partials, values]);

	const [sendEmail] = useMutation(SendTestEmailDocument);
	const notificationService = useInjector(NotificationService);

	const [testEmail, setTestEmail] = React.useState("");

	const sendTestEmail = () => {
		if (!template) return;

		if (!testEmail) {
			notificationService.error("Missing test email");
			return;
		}

		sendEmail({
			input: {
				template: template.code,
				to: testEmail,
			},
		}).then((res) => {
			if (res.sendTestEmail) {
				notificationService.success(
					`Send test email successfully for ${template.name}`
				);
			} else {
				notificationService.error(
					"Send test email failed or missing test data"
				);
			}
		});
	};

	const { fields, append, remove } = useFieldArray({
		name: "phrases",
		control,
	});

	const canAttachInvoice = useMemo(() => {
		if (!template) return false;

		return template.code === "order-confirmation";
	}, [template]);

	return (
		<>
			<PageBlock>
				<ActionBar>
					<button
						className="btn btn-primary"
						disabled={!formState.isDirty}
						onClick={onSubmit}
					>
						Save
					</button>
				</ActionBar>
			</PageBlock>
			<PageDetailLayout
				sidebar={
					<>
						{template && (
							<>
								<Card>
									<div className="form-group">
										<label htmlFor="enable">Enabled</label>
										<div className="input-row">
											<input
												id="enable"
												type="checkbox"
												className="form-control"
												{...form.register("enabled")}
												disabled={template.type === "partials"}
											/>
										</div>
									</div>
								</Card>

								{canAttachInvoice && (
									<Card title="Attach Invoice PDF">
										<div className="form-group">
											<label htmlFor="enable">Attach File</label>
											<div className="input-row">
												<input
													id="enable"
													type="checkbox"
													className="form-control"
													{...form.register("attachFile")}
													disabled={template.type === "partials"}
												/>
											</div>
										</div>
									</Card>
								)}

								{template.type !== "partials" && (
									<Card title="Test Email">
										<div className="form-group">
											<label htmlFor="to">To</label>
											<div className="input-row">
												<input
													id="to"
													name="email"
													type="email"
													className="form-control"
													value={testEmail}
													onChange={(e) => setTestEmail(e.target.value)}
												/>
											</div>
										</div>

										<div className="flex justify-end">
											<button
												className="ml-auto mt-2 btn btn-primary"
												onClick={sendTestEmail}
											>
												Send
											</button>
										</div>
									</Card>
								)}

								<Card>
									<div>
										<div className="property">
											<div className="prop-label">ID:</div>
											<div className="value">{template.id}</div>
										</div>
										<div className="property">
											<div className="prop-label">Created At:</div>
											<div className="value">{template.createdAt}</div>
										</div>
										<div className="property">
											<div className="prop-label">Updated At:</div>
											<div className="value">{template.updatedAt}</div>
										</div>
									</div>
								</Card>

								<Card title="Template helpers">
									<div>
										<div className="property">
											<div className="prop-label">Format Money: </div>
											<div className="value">{`{{ formatMoney }}`}</div>
										</div>
										<div className="property">
											<div className="prop-label">Format DateTime: </div>
											<div className="value">{`{{ formatDate }}`}</div>
										</div>
										<div className="property">
											<div className="prop-label">Format Address: </div>
											<div className="value">
												{`{{ formatAddress }}`} (can only used with
												shippingAddress and billingAddress in order)
											</div>
										</div>
										<div className="property">
											<div className="prop-label">Condition check: </div>
											<div className="value">{`
											{{ #when 'cond1' ('eq'|'noteq'|'gt'|'gteq'|'lt'|'lteq'|'or'|'and'|'%') 'cond2' }}
											...
											{{/when}}`}</div>
										</div>
									</div>
								</Card>
							</>
						)}
					</>
				}
			>
				<PageBlock>
					<Card>
						<Tab.Group
							className="tab-group"
							tabs={[
								{ label: "Phrases", value: "phrases" },
								{ label: "Code", value: "code" },
								{ label: "Preview", value: "preview" },
							]}
						>
							<Tab.Panels>
								<Tab.Panel value="phrases">
									{fields.map((phrase, idx) => (
										<div
											className="mb-1 w-full flex items-center gap-x-5"
											id={phrase.id}
										>
											<div>
												<input
													type="text"
													className="form-control"
													{...register(`phrases.${idx}.key`)}
												/>
											</div>
											<div className="flex-1">
												<input
													type="text"
													className="form-control w-full"
													{...register(`phrases.${idx}.value`)}
												/>
											</div>

											<button
												onClick={() => remove(idx)}
												className="btn btn-ghost"
											>
												<CdsIcon icon={trashIcon} />
											</button>
										</div>
									))}

									<button
										className="btn"
										onClick={() =>
											append({
												key: "",
												value: "",
											})
										}
									>
										<CdsIcon icon={plusIcon} />
										Add phrase
									</button>
								</Tab.Panel>
								<Tab.Panel value="code">
									<Controller
										control={control}
										name="template"
										render={({ field }) => (
											<TemplateEditor
												value={field.value ?? ""}
												onChange={field.onChange}
												form={form}
											/>
										)}
									/>
								</Tab.Panel>
								<Tab.Panel value="preview">
									<div dangerouslySetInnerHTML={{ __html: bodyToHtml }}></div>
								</Tab.Panel>
							</Tab.Panels>
						</Tab.Group>
					</Card>

					{/* <Card>
						<div className="form-grid">
							<div className="form-group form-grid-span">
								<label htmlFor="template" className="flex justify-between">
									Template
									<button
										className="btn btn-ghost"
										onClick={() => setIsPreview(!isPreview)}
									>
										{isPreview ? "Edit" : "Preview"}
									</button>
								</label>
								{isPreview ? (
									<div dangerouslySetInnerHTML={{ __html: bodyToHtml }}></div>
								) : (
									<Controller
										control={control}
										name="template"
										render={({ field }) => (
											<TemplateEditor
												value={field.value ?? ""}
												onChange={field.onChange}
												form={form}
											/>
										)}
									/>
								)}

								<button className="btn mt-2 " onClick={onResetDefault}>
									Reset to default
								</button>
							</div>
						</div>
					</Card> */}

					{template && (
						<Card title="Template Variables">
							<table className="custom max-w-full">
								{templateVars[template.type] &&
									Object.keys(templateVars[template.type]).map((key) => {
										const value = templateVars[template.type][key];

										return (
											<tbody className="" key={key}>
												<tr className=" ">
													<th colSpan={2} className="text-left uppercase">
														{key}
													</th>
												</tr>

												{Object.keys(value).map((k) => {
													return (
														<tr key={k}>
															<th className="text-left w-1/2">{k}:</th>
															<td>{value[k]}</td>
														</tr>
													);
												})}
											</tbody>
										);
									})}
							</table>
						</Card>
					)}
				</PageBlock>
			</PageDetailLayout>
		</>
	);
}

function getTemplateData(template: EmailTemplateDetail | undefined) {
	return {
		subject: template?.subject || "",
		template: template?.template || "",
		enabled: template?.enabled || true,
		phrases: template?.phrases || [],
		attachFile: template?.attachFile || false,
	};
}

function registerHelpers(partials: any[]) {
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

	partials.forEach(({ name, content }: { name: string; content: string }) =>
		Handlebars.registerPartial(name, content)
	);
}
