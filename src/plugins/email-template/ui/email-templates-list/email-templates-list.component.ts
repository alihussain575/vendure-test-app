import { Component } from "@angular/core";
import {
	DataService,
	NotificationService,
	SharedModule,
} from "@vendure/admin-ui/core";

import { chain } from "lodash";
import { Observable, map } from "rxjs";
import {
	EmailTemplateFragment,
	GetEmailTemplatesDocument,
	GetEmailTemplatesQuery,
	UpdateEmailTemplateDocument,
} from "../generated-admin-types";

@Component({
	templateUrl: "./email-templates-list.component.html",
	styleUrls: ["./email-templates-list.component.scss"],
	standalone: true,
	imports: [SharedModule],
})
export class EmailTemplateList {
	constructor(
		private dataService: DataService,
		private notificationService: NotificationService
	) {}

	templates$: Observable<GetEmailTemplatesQuery["emailTemplates"]>;

	templateByTypes$: Observable<
		Record<string, GetEmailTemplatesQuery["emailTemplates"]>
	>;

	ngOnInit() {
		this.templates$ = this.dataService
			.query(GetEmailTemplatesDocument)
			.refetchOnChannelChange()
			.mapStream((data) => data.emailTemplates);

		this.templateByTypes$ = this.templates$.pipe(
			map((templates) => {
				return chain(templates).groupBy("type").value();
			})
		);
	}

	onEnableChange(template: EmailTemplateFragment) {
		this.dataService
			.mutate(UpdateEmailTemplateDocument, {
				input: { id: template.id, enabled: !template.enabled },
			})
			.subscribe();
	}
}
