import { registerRouteComponent } from "@vendure/admin-ui/core";
import { GetPageDocument } from "./generated-admin-types";
import { PageDetailComponent } from "./page-detail/page-detail.component";
import { PageListComponent } from "./page-list/page-list.component";

export default [
	registerRouteComponent({
		path: "",
		component: PageListComponent,
		breadcrumb: [{ label: "Pages", link: [] }],
	}),
	registerRouteComponent({
		path: ":id",
		component: PageDetailComponent,
		entityKey: "page",
		query: GetPageDocument,
		getBreadcrumbs(entity) {
			if (entity) {
				return [
					{ label: "Pages", link: ["/extensions/pages"] },
					{ label: entity.title, link: [] },
				];
			}

			return [
				{ label: "Pages", link: ["/extensions/pages"] },
				{ label: "New Page", link: [] },
			];
		},
	}),
];
