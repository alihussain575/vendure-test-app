import { NgModule, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@vendure/admin-ui/core";
import { OrderMessageDialogComponent } from "./order-message-dialog/order-message.component";

import { OrderMessageListComponent } from "./order-message-list/order-message-list.component";
import { MessageListComponent } from "./message-list-component/message-list-component.component";

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild([
			{
				path: "",
				pathMatch: "full",
				component: MessageListComponent,
				data: {
					breadcrumb: "Unread Messages",
				},
			},
		]),
	],
	declarations: [
		OrderMessageDialogComponent,
		OrderMessageListComponent,
		MessageListComponent,
	],
})
export class OrderMessageModule {}
