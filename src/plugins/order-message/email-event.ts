import { RequestContext, VendureEvent } from "@vendure/core";
import { EmailEventListener } from "@vendure/email-plugin";
import { OrderMessage } from "./entities/order-message.entity";

export class OrderMessageEvent extends VendureEvent {
	constructor(public ctx: RequestContext, public orderMessage: OrderMessage) {
		super();
	}
}

export const orderMessageEvent = new EmailEventListener("order-message")
	.on(OrderMessageEvent)
	.setRecipient((event) => event.orderMessage.to)
	.setFrom("{{ fromAddress }}")
  .setSubject("{{ subject }}")
  .setTemplateVars((event) => ({
    subject: event.orderMessage.subject,
    message: event.orderMessage.message,
  }))
