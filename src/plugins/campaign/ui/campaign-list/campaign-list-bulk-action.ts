import { createBulkDeleteAction, ItemOf } from "@vendure/admin-ui/core";
import {
	DeleteCampaignsDocument,
	ListCampaignsQuery,
} from "../generated-admin-types";
import { map } from "rxjs/operators";

export const deleteCampaignBulkAction = createBulkDeleteAction<
	ItemOf<ListCampaignsQuery, "campaigns">
>({
	location: "campaign-list",
	getItemName: (item) => item.name,
	bulkDelete(dataService, ids, retrying) {
		return dataService
			.mutate(DeleteCampaignsDocument, { ids })
			.pipe(map((data) => []));
	},
});
