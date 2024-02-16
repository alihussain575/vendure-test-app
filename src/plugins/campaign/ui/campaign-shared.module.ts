import { NgModule } from "@angular/core";
import {
	SharedModule,
	addNavMenuItem,
	registerBulkAction,
} from "@vendure/admin-ui/core";

import { deleteCampaignBulkAction } from "./campaign-list/campaign-list-bulk-action";

@NgModule({
	imports: [SharedModule],
	providers: [
		addNavMenuItem(
			{
				id: "campaign",
				label: "Campaigns",
				routerLink: ["/extensions/campaign"],
			},
			"sales",
			"orders"
		),
		registerBulkAction(deleteCampaignBulkAction),
	],
})
export class CampaignSharedModule {}
