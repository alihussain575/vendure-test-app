import { Injectable } from "@nestjs/common";
import { Customer, Order } from "@vendure/core";
import fs from "fs";
import pdf from "html-pdf";
import moment from "moment";
import path from "path";
import { OrderAddress } from "src/generated-admin-types";

@Injectable()
export class PdfService {
	// private doc: jsPDF;
	constructor() {
		// this.doc = new jsPDF();
	}

	/**
	 * PDF generation from HTML will be save at /static/email/attachments/{{filename}}
	 * Returns filepath of generated pdf
	 * @param htmlContent Html string to be converted to PDF
	 * @param filename name of pdf file
	 */
	async generatePDFfromHTML(htmlContent: string, filename: string) {
		const filepath = path.join(
			process.cwd(),
			"static/email/attachments",
			filename
		);

		// check if filepath exists
		// if not create directory
		// if directory exists, save pdf
		// if directory does not exists, create directory and save pdf
		if (!fs.existsSync(path.dirname(filepath))) {
			fs.mkdirSync(path.dirname(filepath), { recursive: true });
		}

		pdf
			.create(htmlContent, {
				childProcessOptions: {
					// @ts-ignore
					env: {
						OPENSSL_CONF: "/dev/null",
					},
				},
			})
			.toFile(filepath, (err: any, res: any) => {
				if (err) return console.log(err);
				console.log("PDF generated successfully");
			});

		return filepath;
	}

	async readFile(filepath: string) {
		const data = fs.readFileSync(filepath);

		return data;
	}

	async generateInvoiceHtml(order: Order) {
		const {
			lines,
			shippingAddress: shipping,
			billingAddress: billing,
			customer,
			payments,
		} = order;
		const {
			firstName = "firstName",
			lastName = "lastName",
			emailAddress = "test@mail.com",
		} = customer || ({} as Customer);

		const {
			subTotalWithTax,
			totalWithTax: orderTotal,
			shipping: shippingCost,
		} = order;
		const logo_url = path.join(process.cwd(), "static/images/logo.webp");
		const logo = fs.readFileSync(logo_url).toString("base64");

		const payment = payments?.[0];
		// console.log(payment);
		const payment_method =
			payment?.metadata?.paymentInfo.brand.toUpperCase() +
			"/" +
			payment?.method?.toUpperCase();
		const transaction_id = payment?.transactionId;
		const payment_date = moment(payment?.createdAt).format("MMMM DD,YYYY");
		const last4 = payment?.metadata?.paymentInfo.last4;

		const itemsHtml = lines
			.map((item) => {
				const {
					productVariant: { name },
					quantity,
					unitPriceWithTax,
					linePriceWithTax,
				} = item;
				return `<tr>
        <td>${name}</td>
        <td>${quantity}</td>
        <td>${formatMoney(unitPriceWithTax)}</td>
        <td>${formatMoney(linePriceWithTax)}</td>
      </tr>`;
			})
			.join("");
		return `<html>
      <head>
        <style>
          .invoice {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            font-weight: 300;
          }
          .invoice > .detail td, .invoice > .detail th {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .invoice > .detail tr:nth-child(even){background-color: #f2f2f2;}
          .invoice > .detail tr:hover {background-color: #ddd;}
          .invoice th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            background-color: #4CAF50;
            color: white;
          }
        </style>
      </head>
      <body>
      <table class="invoice">
      <tbody>
      <tr>
        <td style="font-size: 20px; font-weight: bold;">Receipt</td>
        <td></td>
        <td></td>
        <td>
          <img src="data:image/png;base64,${logo}" alt="logo" width="100" height="50" />
        </td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>Order ID</td>
        <td>${order.code}</td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>Payment Method</td>
        <td>${payment_method} - ${last4}</td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>Currency </td>
        <td>${order.currencyCode}</td>
        <td></td>
        <td></td>
      </tr>
    <tr>
      <td>Transaction ID</td>
      <td>${transaction_id}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Amount Paid</td>
      <td>${formatMoney(orderTotal)}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Payment Date</td>
      <td>${payment_date}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Company Detail</td>
      <td></td>
      <td></td>
      <td>Bill To</td>
    </tr>
    <tr>
      <td>waves2cure, Pune, India</td>
      <td></td>
      <td></td>
      <td>${billing.fullName ?? shipping.fullName}</td>
    </tr>
    <tr>
      <td>support@waves2cure.com</td>
      <td></td>
      <td></td>
      <td>${emailAddress}</td>
    </tr>
    <tr>
      <td>91-7498843182</td>
      <td></td>
      <td></td>
      <td>${formatAddress(billing.fullName ? billing : shipping)}</td>
    </tr>
    <tr>
      <td colspan="2">GSTIN: 27AKLPT3432E1Z2</td>
      <td></td>
      <td>${billing.phoneNumber ?? shipping.phoneNumber}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    </tbody>
    <br/>
    <br/> 

    <tbody  class="detail">
    <tr>
      <th>Description</th>
      <th>Qty</th>
      <th>Unit Price</th>
      <th>Amount</th>
    </tr>
    ${itemsHtml}

    <tr>
      <td></td>
      <td></td>
      <td>Sub Total</td>
      <td>${formatMoney(subTotalWithTax)} </td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td>Total</td>
      <td>${formatMoney(orderTotal)}</td>
    </tr>
    </tbody>
  </table>
        
        
      </body>
    </html>`;
	}
}

function formatMoney(amount: number) {
	return (amount / 100).toFixed(2);
}

function formatAddress(address: OrderAddress) {
	return `${address.streetLine1}, ${address.streetLine2}, ${address.city}, ${address.province}, ${address.postalCode}, ${address.countryCode}`;
}
