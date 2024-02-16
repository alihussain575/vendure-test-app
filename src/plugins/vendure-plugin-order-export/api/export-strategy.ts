import {
	Injector,
	InternalServerError,
	Logger,
	OrderService,
	// Datase
	RequestContext,
} from "@vendure/core";
import os from "os";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { loggerCtx } from "../constants";

export interface ExportInput {
	ctx: RequestContext;
	orderService: OrderService;
	startDate: Date;
	endDate: Date;
}

export interface ExportStrategy {
	readonly name: string;
	/**
	 * ContentType of the export file. For example "text/csv" or "application/pdf"
	 */
	readonly contentType: string;
	/**
	 * File extension without the ".", for example "csv" or "pdf"
	 */
	readonly fileExtension: string;

	/**
	 * Write your desired exportfile and return the filePath.
	 * Your exportfile will be deleted after it has been streamed to the client
	 */
	createExportFile(input: ExportInput): Promise<string>;
}

interface OrderRow {
	[key: number]: string | number;
}

export class DefaultExportStrategy implements ExportStrategy {
	readonly name = "orders-report";
	readonly contentType = "text/csv";
	readonly fileExtension = "csv";

	async createExportFile({
		ctx,
		startDate,
		endDate,
		orderService,
	}: ExportInput): Promise<string> {
		console.log(startDate, endDate);
		const orders = await orderService.findAll(
			ctx,
			{
				filter: {
					// orderPlacedAt: {
					// between: {
					//   start: startDate,
					//   end: endDate,
					// },
					// },
					orderPlacedAt: {
						between: {
							start: startDate,
							end: endDate,
						},
					},
				},
			},
			[
				"customer",
				"lines",
				"lines.productVariant",
				"channels",
				"shippingLines",
				"shippingLines.shippingMethod",
				"payments",
			]
		);
		if (orders.totalItems > orders.items.length) {
			// This is just a sample strategy, so this is oke
			throw new InternalServerError(
				"Too many orders, getting paginated orders is not implemented."
			);
		}

		Logger.info(`Exporting ${orders.items.length} orders`, loggerCtx);
		const rows: OrderRow[] = orders.items.map((order) => ({
			id: order.id,
			customerId: order.customer?.id,
			customerName: order.customer?.firstName + " " + order.customer?.lastName,
			customerEmail: order.customer?.emailAddress,
			customerPhone: order.customer?.phoneNumber,
			orderDate: order.orderPlacedAt?.toDateString() || "",
			orderState: order.state,
			subTotalWithTax: this.formatCurrency(order.subTotalWithTax),
			subTotal: this.formatCurrency(order.subTotal),
			taxTotal: this.formatCurrency(
				order.taxSummary.reduce((acc, tax) => acc + tax.taxTotal, 0)
			),
			shippingCostWithTax: this.formatCurrency(order.shippingWithTax),
			shippingCost: this.formatCurrency(order.shipping),
			shippingMethod: order.shippingLines?.[0]?.shippingMethod?.name || "",
			couponDetails: order.couponCodes,
			orderTotalWithTax: this.formatCurrency(order.totalWithTax),
			orderTotal: this.formatCurrency(order.total),
			paymentMethod: order.payments[0].method || "",
			totalQuantity: order.lines.reduce((acc, line) => acc + line.quantity, 0),
			totalShipped: order.lines.reduce((acc, line) => acc + line.quantity, 0),
			dateShipped: order.shippingLines?.[0]?.createdAt?.toDateString() || "",
			orderCurrencyCode: order.currencyCode,
			orderNote: "",
			billingFirstName: order.billingAddress?.fullName,
			billingLastName: order.billingAddress?.fullName,
			billingCompany: order.billingAddress?.company,
			billingStreet1: order.billingAddress?.streetLine1,
			billingStreet2: order.billingAddress?.streetLine2,
			billingCity: order.billingAddress?.city,
			billingState: order.billingAddress?.province,
			billingZip: order.billingAddress?.postalCode,
			billingCountry: order.billingAddress?.country,
			billingPhone: order.billingAddress?.phoneNumber,
			billingEmail: order.customer?.emailAddress,
			shippingFirstName: order.shippingAddress?.fullName,
			shippingLastName: order.shippingAddress?.fullName,
			shippingCompany: order.shippingAddress?.company,
			shippingStreet1: order.shippingAddress?.streetLine1,
			shippingStreet2: order.shippingAddress?.streetLine2,
			shippingCity: order.shippingAddress?.city,
			shippingState: order.shippingAddress?.province,
			shippingZip: order.shippingAddress?.postalCode,
			shippingCountry: order.shippingAddress?.country,
			shippingPhone: order.shippingAddress?.phoneNumber,
			shippingEmail: order.customer?.emailAddress,
			productDetails: order.lines
				.map(
					(line) =>
						`Product ID: ${line.productVariantId}, Product Qty: ${
							line.quantity
						}, Product SKU: ${line.productVariant.sku}, Product Name: ${
							line.productVariant.name
						}, Product Weight: 0.0000, Product Variant Details: Session Repetition: ${
							line.productVariant.options
						}, Product Unit Price: ${this.formatCurrency(
							line.unitPriceWithTax
						)}, Product Total Price: ${this.formatCurrency(
							line.linePriceWithTax
						)}`
				)
				.join("|"),
			refundAmount: order.payments?.[0]?.refunds?.[0]?.total || 0,
			channelID: ctx.channelId,
			channelName: ctx.channel.code,
		}));
		// Write to file
		const fileName = `${new Date().getTime()}-${startDate.getTime()}-${endDate.getTime()}.${
			this.fileExtension
		}`;
		const exportFile = path.join(os.tmpdir(), fileName);
		const csvWriter = createObjectCsvWriter({
			path: exportFile,
			header: [
				{ title: "Order ID", id: "id" },
				{ title: "Customer ID", id: "customerId" },
				{ title: "Customer Name", id: "customerName" },
				{ title: "Customer Email", id: "customerEmail" },
				{ title: "Customer Phone", id: "customerPhone" },
				{ title: "Order Date", id: "orderDate" },
				{ title: "Order Status", id: "orderState" },
				{ title: "Subtotal (inc tax)", id: "subTotalWithTax" },
				{ title: "Subtotal (ex tax)", id: "subTotal" },
				{ title: "Tax Total", id: "taxTotal" },
				{ title: "Shipping Cost (inc tax)", id: "shippingCostWithTax" },
				{ title: "Shipping Cost (ex tax)", id: "shippingCost" },
				{ title: "Ship Method", id: "shippingMethod" },
				{ title: "Handling Cost (inc tax)", id: "handlingCost" },
				{ title: "Handling Cost (ex tax)", id: "handlingCost" },
				{ title: "Store Credit Redeemed", id: "creditRedeemed" },
				{ title: "Gift Certificate Amount Redeemed", id: "amountRedeemed" },
				{ title: "Gift Certificate Code", id: "giftCode" },
				{ title: "Gift Certificate Expiration Date", id: "giftExDate" },
				{ title: "Coupon Details", id: "couponDetails" },
				{ title: "Order Total (inc tax)", id: "orderTotalWithTax" },
				{ title: "Order Total (ex tax)", id: "orderTotal" },
				{ title: "Payment Method", id: "paymentMethod" },
				{ title: "Total Quantity", id: "totalQuantity" },
				{ title: "Total Shipped", id: "totalShipped" },
				{ title: "Date Shipped", id: "dateShipped" },
				{ title: "Order Currency Code", id: "orderCurrencyCode" },
				{ title: "Exchange Rate", id: "orderExchangeRate" },
				{ title: "Order Notes", id: "orderNote" },
				{ title: "Customer Message", id: "customerMessage" },
				{ title: "Billing First Name", id: "billingFirstName" },
				{ title: "Billing Last Name", id: "billingLastName" },
				{ title: "Billing Company", id: "billingCompany" },
				{ title: "Billing Street 1", id: "billingStreet1" },
				{ title: "Billing Street 2", id: "billingStreet2" },
				{ title: "Billing Suburb", id: "billingCity" },
				{ title: "Billing State", id: "billingState" },
				{ title: "Billing Zip", id: "billingZip" },
				{ title: "Billing Country", id: "billingCountry" },
				{ title: "Billing Phone", id: "billingPhone" },
				{ title: "Billing Email", id: "billingEmail" },
				{ title: "Shipping First Name", id: "shippingFirstName" },
				{ title: "Shipping Last Name", id: "shippingLastName" },
				{ title: "Shipping Company", id: "shippingCompany" },
				{ title: "Shipping Street 1", id: "shippingStreet1" },
				{ title: "Shipping Street 2", id: "shippingStreet2" },
				{ title: "Shipping Suburb", id: "shippingCity" },
				{ title: "Shipping State", id: "shippingState" },
				{ title: "Shipping Zip", id: "shippingZip" },
				{ title: "Shipping Country", id: "shippingCountry" },
				{ title: "Shipping Phone", id: "shippingPhone" },
				{ title: "Shipping Email", id: "shippingEmail" },
				{ title: "Product Details", id: "productDetails" },
				{ title: "Refund Amount", id: "refundAmount" },
				{ title: "Channel ID", id: "channelID" },
				{ title: "Channel Name", id: "channelName" },
			],
		});
		await csvWriter.writeRecords(rows);
		return exportFile;
	}

	private formatCurrency(value: number): string {
		return (value / 100).toFixed(2);
	}
}
