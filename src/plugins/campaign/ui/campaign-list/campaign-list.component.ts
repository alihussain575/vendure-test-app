import { Component, ChangeDetectionStrategy } from "@angular/core";

import { DataService, TypedBaseListComponent } from "@vendure/admin-ui/core";
import {
	ListCampaignsDocument,
	UpdateCampaignDocument,
} from "../generated-admin-types";
import { map, take } from "rxjs";

@Component({
	templateUrl: "./campaign-list.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignListComponent extends TypedBaseListComponent<
	typeof ListCampaignsDocument,
	"campaigns"
> {
	readonly sorts = this.createSortCollection()
		.defaultSort("createdAt", "DESC")
		.addSort({ name: "createdAt" })
		.addSort({ name: "updatedAt" })
		.connectToRoute(this.route);

	readonly filters = this.createFilterCollection()
		// .addIdFilter()
		// .addDateFilters()
		.addFilter({
			name: "name",
			type: { kind: "text" },
			label: "Name",
			filterField: "name",
		})
		.connectToRoute(this.route);

	constructor(protected dataService: DataService) {
		super();

		super.configure({
			document: ListCampaignsDocument,
			getItems: (result) => result.campaigns,
			setVariables: (skip, take) => ({
				options: {
					skip,
					take,
					filter: {
						name: {
							contains: this.searchTermControl.value,
						} as any,
						...this.filters.createFilterInput(),
					},
					sort: this.sorts.createSortInput(),
				},
			}),
			refreshListOnChanges: [
				this.filters.valueChanges,
				this.sorts.valueChanges,
			],
		});
	}

	create() {}

	toggleActive(id: string, active: boolean) {
		this.dataService
			.mutate(UpdateCampaignDocument, {
				input: {
					id: id,
					active: !active,
				},
			})
			.subscribe((result) => {
				console.log({ result });
				this.refresh();
			});
	}

	update() {}

	delete() {}
}
