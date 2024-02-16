import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SharedModule, TypedBaseListComponent } from "@vendure/admin-ui/core";
import { GetPagesDocument, PageStatus } from "../generated-admin-types";

@Component({
	templateUrl: "./page-list.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [SharedModule],
})
export class PageListComponent extends TypedBaseListComponent<
	typeof GetPagesDocument,
	"pages"
> {
	readonly sorts = this.createSortCollection()
		.defaultSort("createdAt", "DESC")
		.addSort({ name: "createdAt" })
		.addSort({ name: "updatedAt" })
		.addSort({ name: "id" })
		.addSort({ name: "sort_order" })
		.connectToRoute(this.route);

	readonly filters = this.createFilterCollection()
		.addIdFilter()
		.addFilter({
			type: { kind: "text" },
			name: "title",
			label: "Title",
		})
		.connectToRoute(this.route);

	constructor() {
		super();

		super.configure({
			document: GetPagesDocument,
			getItems: (data) => data.pages,
			setVariables: (skip, take) => ({
				options: {
					skip,
					take,
					filter: {
						...this.filters.createFilterInput(),
					},
					sort: { ...this.sorts.createSortInput() },
				},
			}),
			refreshListOnChanges: [
				this.sorts.valueChanges,
				this.filters.valueChanges,
			],
		});
	}

	pageStatus = {
		draft: "Draft",
    published: "Published",
	};
}
