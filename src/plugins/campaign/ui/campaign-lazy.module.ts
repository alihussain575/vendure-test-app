import { NgModule, inject } from "@angular/core";
import { SharedModule, DataService } from "@vendure/admin-ui/core";
import { RouterModule } from "@angular/router";
import { of, Observable, map } from "rxjs";

import { CampaignListComponent } from "./campaign-list/campaign-list.component";
import { GetCampaignDocument, GetCampaignQuery } from "./generated-admin-types";
import { CampaignDetailComponent } from "./campaign-detail/campaign-detail.component";
import { AddonSelectDialog } from "./addon-select-dialog/addon-select-dialog.component";

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild([
			{
				path: "",
				pathMatch: "full",
				component: CampaignListComponent,
				data: {
					breadcrumb: [
						{
							label: "Campaigns",
							link: [],
						},
					],
				},
			},
			{
				path: ":id",
				component: CampaignDetailComponent,
				resolve: {
					detail: (route: any) => {
						var id = route.paramMap.get("id");

						return inject(DataService)
							.query(GetCampaignDocument, { id })
							.mapStream((data) => ({
								entity: of(data.campaign),
							}));
					},
				},
				data: {
					breadcrumb: (data: {
						detail: {
							entity: Observable<NonNullable<GetCampaignQuery["campaign"]>>;
						};
					}) =>
						data.detail.entity.pipe(
							map((entity) => [
								{
									label: "Campaigns",
									link: ["/extensions", "campaign"],
								},
								{
									label: `${entity?.name ?? "Create Campaign"}`,
									link: [],
								},
							])
						),
				},
			},
		]),
	],
	declarations: [
		CampaignListComponent,
		CampaignDetailComponent,
		AddonSelectDialog,
	],
})
export class CampaignLazyModule {}
