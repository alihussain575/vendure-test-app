import { addNavMenuSection, registerBulkAction } from "@vendure/admin-ui/core";
import bulkDeleteAction from "./page-list/page-list-bulk-action";

export default [
	addNavMenuSection(
		{
			id: "cms",
			label: "CMS",
			items: [
				{
					id: "pages",
					label: "Pages",
					routerLink: ["/extensions/pages"],
					// Icon can be any of https://core.clarity.design/foundation/icons/shapes/
					icon: "cursor-hand-open",
				},
			],
		},
		// Add this section before the "settings" section
		"settings"
	),
	registerBulkAction(bulkDeleteAction),
];
