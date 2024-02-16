import { ChangeDetectionStrategy, Component } from "@angular/core";

import {
	CustomDetailComponent,
	ModalService,
	NotificationService,
	TypedBaseListComponent,
} from "@vendure/admin-ui/core";

import { UntypedFormGroup } from "@angular/forms";
import { EMPTY, Observable, combineLatest } from "rxjs";
import { switchMap, take } from "rxjs/operators";
import {
	DeleteOrderMessageDocument,
	GetOrderMessagesDocument,
	MarkAsReadDocument,
	OrderDetailFragment,
	OrderMessageFragment,
} from "../generated-admin-types";
import { OrderMessageDialogComponent } from "../order-message-dialog/order-message.component";

@Component({
	selector: "vdr-order-message-list",
	templateUrl: "./order-message-list.component.html",
	styleUrls: ["./order-message-list.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMessageListComponent
	extends TypedBaseListComponent<
		typeof GetOrderMessagesDocument,
		"getOrderMessages"
	>
	implements CustomDetailComponent
{
	readonly sorts = this.createSortCollection()
		.defaultSort("createdAt", "DESC")
		.addSort({
			name: "createdAt",
		})
		.connectToRoute(this.route);

	constructor(
		private modalService: ModalService,
		private notificationService: NotificationService
	) {
		super();

		super.configure({
			document: GetOrderMessagesDocument,
			getItems: (result) => result.getOrderMessages,
			setVariables: (skip, take) => ({
				orderId: this.route.snapshot.params.id ?? "",
				options: {
					skip,
					take,
					sort: {
						...this.sorts.createSortInput(),
					},
				},
			}),
			refreshListOnChanges: [this.sorts.valueChanges],
		});
	}

	entity$: Observable<OrderDetailFragment>;
	detailForm: UntypedFormGroup;

	onNew() {
		combineLatest([this.entity$, this.totalItems$])
			.pipe(
				take(1),
				switchMap(([order, totalItems]) => {
					if (!order.customer) {
						return EMPTY;
					}

					return this.modalService.fromComponent(OrderMessageDialogComponent, {
						size: "md",
						locals: {
							order: order,
							isFirst: totalItems <= 0,
						},
					});
				})
			)
			.subscribe((result) => {
				console.log({ result });
				if (result) {
					this.notificationService.success("Order message sent");
				}
				this.refresh();
			});
	}

	onView(message: OrderMessageFragment) {
		this.markAsRead(message);
		this.modalService
			.fromComponent(OrderMessageDialogComponent, {
				size: "md",
				locals: {
					// order: this.entity$.pipe(take(1)),
					// isFirst: false,
					message,
					isNew: false,
				},
			})
			.subscribe();
	}

	markAsRead(item: OrderMessageFragment) {
		// console.log({ item });
		if (!item.replyTo || item.status !== 1) return;

		this.dataService
			.mutate(MarkAsReadDocument, { id: item.id })
			.subscribe(() => {
				this.notificationService.success("Order message marked as read");
				this.refresh();
			});
	}

	onRefetch() {
		this.refresh();
	}

	remove(item: OrderMessageFragment) {
		console.log({ item });

		this.dataService
			.mutate(DeleteOrderMessageDocument, { id: item.id })
			.subscribe(() => {
				this.notificationService.success("Order message deleted");
				this.refresh();
			});
	}
}
