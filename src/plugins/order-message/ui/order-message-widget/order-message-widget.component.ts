import { Component, OnInit } from "@angular/core";
import { SharedModule, DataService } from "@vendure/admin-ui/core";
import {
	GetAllOrderMessagesQuery,
	GetAllOrderMessagesDocument,
	SortOrder,
	OrderMessageFragment,
	MarkAsReadDocument,
} from "../generated-admin-types";
import { Observable } from "rxjs";

@Component({
	selector: "vdr-order-message",
	templateUrl: "./order-message-widget.component.html",
	styleUrls: ["./order-message-widget.component.scss"],
	standalone: true,
	imports: [SharedModule],
})
export class OrderMessageWidget implements OnInit {
	constructor(private dataService: DataService) {}

	orderMessages$: Observable<GetAllOrderMessagesQuery["allOrderMessages"]>;

	ngOnInit(): void {
		this.orderMessages$ = this.dataService
			.query(GetAllOrderMessagesDocument, {
				options: {
					skip: 0,
					take: 10,
					sort: {
						createdAt: SortOrder.DESC,
					},
					filter: {
						status: { eq: 1 },
						from: { regex: ".+@.+" },
					},
				},
			})
			.mapSingle((data) => data.allOrderMessages);
	}

	markAsRead(item: OrderMessageFragment) {
		this.dataService
			.mutate(MarkAsReadDocument, {
				id: item.id,
			})
			.subscribe();
	}
}
