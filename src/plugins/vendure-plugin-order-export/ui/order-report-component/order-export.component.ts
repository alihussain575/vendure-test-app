import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
	DataService,
	getServerLocation,
	LocalStorageService,
	NotificationService,
} from "@vendure/admin-ui/core";
import gql from "graphql-tag";

@Component({
	selector: "order-export-component",
	styleUrls: ["./order-export.component.scss"],
	templateUrl: "./order-export.component.html",
})
export class OrderExportComponent implements OnInit {
	form: FormGroup;
	serverPath: string;
	strategies: string[] = [];

	constructor(
		private formBuilder: FormBuilder,
		protected dataService: DataService,
		private changeDetector: ChangeDetectorRef,
		private notificationService: NotificationService,
		private localStorageService: LocalStorageService
	) {
		this.form = this.formBuilder.group({
			startsAt: null,
			endsAt: null,
			strategy: null,
		});
		this.serverPath = getServerLocation();
	}

	ngOnInit(): void {
		this.dataService
			.query(
				gql`
					query availableOrderExportStrategies {
						availableOrderExportStrategies
					}
				`
			)
			.single$.subscribe((result: any) => {
				this.strategies = result.availableOrderExportStrategies;
				this.form.controls["strategy"].setValue(this.strategies?.[0]);
			});
	}

	async download(): Promise<void> {
		try {
			const res = await fetch(
				`${this.serverPath}/export-orders/export/${this.form.value.strategy}?startDate=${this.form.value.startsAt}&endDate=${this.form.value.endsAt}`,
				{
					headers: this.getHeaders(),
				}
			);
			if (!res.ok) {
				const json = await res.json();
				throw Error(json?.message);
			}
			const header = res.headers.get("Content-Disposition");
			const parts = header!.split(";");
			const filename = parts[1].split("=")[1];
			const blob = await res.blob();
			await this.downloadBlob(blob, filename);
		} catch (err: any) {
			console.error(err);
			this.notificationService.error(err.message);
		}
	}

	private getHeaders(): Record<string, string> {
		const headers: Record<string, string> = {};
		const channelToken = this.localStorageService.get("activeChannelToken");
		if (channelToken) {
			headers["vendure-token"] = channelToken;
		}
		const authToken = this.localStorageService.get("authToken");
		if (authToken) {
			headers.authorization = `Bearer ${authToken}`;
		}
		return headers;
	}

	private async downloadBlob(blob: Blob, fileName: string): Promise<void> {
		const blobUrl = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		document.body.appendChild(a);
		a.setAttribute("hidden", "true");
		a.href = blobUrl;
		a.download = fileName;
		a.setAttribute("target", "_blank");
		a.click();
	}
}
