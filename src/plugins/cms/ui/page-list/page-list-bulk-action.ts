import {
	DataService,
	DeletionResponse,
	createBulkDeleteAction,
} from "@vendure/admin-ui/core";
import { Observable, map } from "rxjs";
import { DeletePagesDocument, PageFragment } from "../generated-admin-types";

export default createBulkDeleteAction({
	location: "page-list",
	getItemName: function (item: PageFragment): string {
		return item.title;
	},
	bulkDelete: function (
		dataService: DataService,
		ids: string[],
		retrying: boolean
	): Observable<DeletionResponse[]> {
		return dataService
			.mutate(DeletePagesDocument, {
				ids,
			})
			.pipe(map((result) => result.deletePages));
	},
});
