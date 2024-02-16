import { NgModule } from "@angular/core";
import {
	SharedModule,
	ModalService,
	NotificationService,
	registerCustomDetailComponent,
	registerDashboardWidget,
	setDashboardWidgetLayout,
	DataService,
	AlertsService,
	registerBulkAction,
	createBulkDeleteAction,
	DeletionResponse,
} from "@vendure/admin-ui/core";
import { OrderMessageListComponent } from "./order-message-list/order-message-list.component";
import {
	DeleteOrderMessagesDocument,
	GetAllOrderMessagesDocument,
	OrderMessage,
} from "./generated-admin-types";
import { Observable, map } from "rxjs";

@NgModule({
	imports: [SharedModule],
	providers: [
		registerCustomDetailComponent({
			locationId: "order-detail",
			component: OrderMessageListComponent,
		}),
		registerDashboardWidget("order-messages", {
			title: "Unread Order Messages",
			supportedWidths: [4, 6, 8, 12],
			loadComponent: () =>
				import("./order-message-widget/order-message-widget.component").then(
					(m) => m.OrderMessageWidget
				),
		}),
		setDashboardWidgetLayout([
			{ id: "metrics", width: 6 },
			{ id: "order-messages", width: 6 },
			{ id: "orderSummary", width: 4 },
			{ id: "latestOrders", width: 8 },
		]),

		registerBulkAction(
			createBulkDeleteAction<OrderMessage>({
				location: "order-messages",
				getItemName: (item) => item.subject,
				bulkDelete: function (
					dataService: DataService,
					ids: string[],
					retrying: boolean
				) {
					return dataService
						.mutate(DeleteOrderMessagesDocument, { ids })
						.pipe(map((data) => []));
				},
			})
		),
	],
})
export class OrderMessageSharedModule {
	constructor(
		private dataService: DataService,
		private alertService: AlertsService
	) {
		this.initAlert();
	}

	private initAlert() {
		this.alertService.configureAlert({
			id: "order-message",
			check: () =>
				this.dataService
					.query(GetAllOrderMessagesDocument, {
						options: {
							filter: {
								status: { eq: 1 },
							},
						},
					})
					.mapSingle((data) => data.allOrderMessages.totalItems),
			isAlert: (data) => data > 0,
			action: (data) => {
				window.location.href = "/admin/extensions/unread-messages";
			},
			label: (data) => ({
				text: `You have ${data} new messages`,
			}),
			recheckIntervalMs: 1000 * 30,
		});
		this.alertService.refresh();
	}
}
