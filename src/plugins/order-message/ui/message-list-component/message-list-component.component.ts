import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from "@angular/core";
import { TypedBaseListComponent } from "@vendure/admin-ui/core";
import {
	GetAllOrderMessagesDocument,
	MarkAsReadDocument,
	OrderMessageFragment,
} from "../generated-admin-types";

@Component({
	selector: "vdr-message-list",
	templateUrl: "./message-list-component.component.html",
	styleUrls: ["./message-list-component.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageListComponent extends TypedBaseListComponent<
	typeof GetAllOrderMessagesDocument,
	"allOrderMessages"
> {
	readonly sorts = this.createSortCollection()
		.defaultSort("createdAt", "DESC")
		.addSort({ name: "createdAt" })
		.connectToRoute(this.route);

	constructor(private changeDetectorRef: ChangeDetectorRef) {
		super();

		super.configure({
			document: GetAllOrderMessagesDocument,
			getItems: (result) => result.allOrderMessages,
			setVariables: (skip, take) => ({
				options: {
					skip,
					take,
					filter: {
						status: { eq: 1 },
					},
					sort: {
						...this.sorts.createSortInput(),
					},
				},
			}),
			refreshListOnChanges: [this.sorts.valueChanges],
		});
	}

	markAsRead(item: OrderMessageFragment) {
		this.dataService.mutate(MarkAsReadDocument, { id: item.id }).subscribe();
	}
}
