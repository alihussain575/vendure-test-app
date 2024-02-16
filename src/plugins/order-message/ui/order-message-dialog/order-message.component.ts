import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	OnChanges,
	SimpleChanges,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import {
	Dialog,
	DataService,
	SharedModule,
	TypedBaseDetailComponent,
	LanguageCode,
} from "@vendure/admin-ui/core";
import {
	GetOrderDocument,
	CreateOrderMessageDocument,
	OrderDetailFragment,
	GetCustomerDocument,
	OrderMessageFragment,
	GetOrderMessageDocument,
	UpdateOrderMessageDocument,
} from "../generated-admin-types";
import { tap, of, Subject } from "rxjs";

@Component({
	templateUrl: "./order-message.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMessageDialogComponent
	extends TypedBaseDetailComponent<
		typeof GetOrderMessageDocument,
		"getOrderMessage"
	>
	implements Dialog<any>, OnInit
{
	protected setFormValues(
		entity: OrderMessageFragment,
		languageCode?: LanguageCode
	): void {
		console.log("setValue");
		this.detailForm.patchValue(
			{
				type: entity.type,
				subject: entity.subject,
				message: entity.message,
				to: entity.to,
				from: entity.from,
			},
			{ emitEvent: true }
		);

		this.mess = entity.message;
	}

	detailForm = this.formBuilder.group({
		type: ["email"],
		subject: [""],
		message: [""],
		to: [""],
		from: [""],
	});

	constructor(
		private changeDetector: ChangeDetectorRef,
		private formBuilder: FormBuilder
	) {
		super();
	}

	resolveWith: (result?: any) => void;

	order?: OrderDetailFragment;
	isFirst: boolean = false;

	message?: OrderMessageFragment;
	isNew: boolean = true;

	mess = "";

	ngOnInit(): void {
		// this.init();

		if (this.order && !this.message) {
			console.log("on init ");
			const customer$ = this.dataService
				.query(GetCustomerDocument, {
					customerId: this.order.customer?.id ?? "",
				})
				.mapSingle((data) => data.customer);

			customer$.subscribe((customer) => {
				const to = `${customer?.firstName} ${customer?.lastName} <${customer?.emailAddress}>`;

				this.detailForm.patchValue(
					{
						to,
						subject: this.isFirst
							? `Order #${this.order?.code}`
							: `Re: Order #${this.order?.code}`,
						message: "",
						from: "admin",
					},
					{ emitEvent: true }
				);
			});
		}

		if (this.message) {
			this.setFormValues(this.message);
		}

		// console.log(this.detailForm.value);
		// this.detailForm.valueChanges.subscribe((value) => {
		// 	console.log({ value });
		// });
	}

	onMessChange(event: string) {
		this.detailForm.patchValue({
			message: event,
		});
		this.detailForm.markAsDirty();
	}

	send() {
		// console.log(this.order);

		if (this.message) {
			this.dataService
				.mutate(UpdateOrderMessageDocument, {
					input: {
						id: this.message.id,
						subject: this.detailForm.value.subject ?? this.message.subject,
						message: this.detailForm.value.message ?? this.message.message,
					},
				})
				.subscribe((result) => {
					this.resolveWith(result.updateOrderMessage);
				});
		} else {
			if (!this.order) return;
			this.dataService
				.mutate(CreateOrderMessageDocument, {
					input: {
						orderId: this.order.id,
						type: this.detailForm.value.type ?? "email",
						subject:
							this.detailForm.value.subject ?? `Order ${this.order.code}`,
						message: this.detailForm.value.message ?? "",
						to: this.detailForm.value.to ?? "",
						from: this.detailForm.value.from ?? "admin",
						status: 1,
					},
				})
				.subscribe((result) => {
					this.resolveWith(result.createOrderMessage);
				});
		}
	}

	cancel() {
		this.resolveWith();
	}
}
