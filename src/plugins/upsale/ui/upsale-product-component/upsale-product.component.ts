import {
	Component,
	OnInit,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	ViewChild,
	ElementRef,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UntypedFormGroup } from "@angular/forms";
import {
	CustomDetailComponent,
	DataService,
	NotificationService,
} from "@vendure/admin-ui/core";
import { Observable, Subject, switchMap, of, map } from "rxjs";
import {
	AddUpsaleToProductDocument,
	GetProductVariantDocument,
	ListUpsaleByProductDocument,
	ListUpsaleByProductQuery,
	ProductVariant,
	RemoveUpsaleDocument,
} from "../generated-admin-types";

@Component({
	selector: "upsale-product-component",
	templateUrl: "./upsale-product.component.html",
	styleUrls: ["./upsale-product.component.scss"],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class UpsaleProductComponent implements OnInit, CustomDetailComponent {
	entity$: Observable<ProductVariant>;
	detailForm: UntypedFormGroup;

	upsaleProducts$: Observable<
		ListUpsaleByProductQuery["listByProduct"]["items"]
	>;

	@ViewChild("textArea", { static: true })
	textArea: ElementRef<HTMLTextAreaElement>;
	selectedVariantId$ = new Subject<string | undefined>();
	selectedVariant$: Observable<any>;
	quantity = 1;

	options: string[] = [];
	isFocussed = false;
	input = "";
	lastSelected = false;
	editingIndex = -1;

	onChangeFn: (value: any) => void;
	onTouchFn: (value: any) => void;

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private notificationService: NotificationService,
		private changeDetector: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		var productVariantId = this.route.snapshot.params.id;
		this.upsaleProducts$ = this.dataService
			.query(ListUpsaleByProductDocument, {
				productVariantId,
			})
			.mapStream((data) => data.listByProduct.items);

		this.entity$.subscribe((productVariant) => {
			this.upsaleProducts$ = this.dataService
				.query(ListUpsaleByProductDocument, {
					productVariantId: productVariant.id,
				})
				.mapStream((data) => data.listByProduct.items);
		});

		this.selectedVariant$ = this.selectedVariantId$.pipe(
			switchMap((id) => {
				if (id) {
					return this.dataService
						.query(GetProductVariantDocument, {
							id,
						})
						.mapSingle((data) => data.productVariant);
				} else {
					return of(undefined);
				}
			})
		);
	}

	registerOnChange(fn: any): void {
		this.onChangeFn = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouchFn = fn;
	}

	onOptionChange() {
		console.log(this.options);
	}

	updateOption(index: number, event: InputEvent) {
		var optionValue = this.options[index];
		const newName = (event.target as HTMLInputElement).value;
		if (optionValue) {
			if (newName) {
				optionValue = newName;
				// this.edit.emit({ index, option: optionValue });
			}
			this.editingIndex = -1;
		}
	}

	removeOption(option: string) {
		// if (!option.locked) {
		// if (this.formValue) {
		// 	this.formValue = this.formValue?.filter((o) => o.name !== option.name);
		// 	this.onChangeFn(this.formValue);
		// } else {
		// 	this.remove.emit(option);
		// }
		// }
		this.options.splice(this.options.indexOf(option), 1);
	}

	focus() {
		this.textArea.nativeElement.focus();
	}

	handleKey(event: KeyboardEvent) {
		switch (event.key) {
			case ",":
			case "Enter":
				this.addOptionValue();
				event.preventDefault();
				break;
			case "Backspace":
				if (this.lastSelected) {
					this.removeLastOption();
					this.lastSelected = false;
				} else if (this.input === "") {
					this.lastSelected = true;
				}
				break;
			default:
				this.lastSelected = false;
		}
	}

	handleBlur() {
		this.isFocussed = false;
		this.addOptionValue();
	}

	addItem(selectedVariant: ProductVariant, quantity: number) {
		var productVariantId = this.route.snapshot.params.id;

		// console.log({ selectedVariant });
		if (selectedVariant) {
			if (
				!selectedVariant.product.optionGroups.find((og) =>
					og.name.toLowerCase().includes("repetition")
				)
			) {
				this.notificationService.error(
					"Add-on product required “Repetitions”. Please check your add-on."
				);

				this.selectedVariantId$.next(undefined);

				return;
			}

			this.updateUpsale(productVariantId, selectedVariant, quantity).subscribe(
				(res) => {
					if (res.addUpsaleToProduct !== null) {
						this.notificationService.success("Upsale added successfully");

						this.upsaleProducts$ = this.dataService
							.query(ListUpsaleByProductDocument, {
								productVariantId,
							})
							.mapStream((data) => {
								return data.listByProduct.items;
							});

						this.selectedVariantId$.next(undefined);
						quantity = 1;
					} else {
						this.notificationService.error("Upsale not added");
					}
				}
			);
		}
	}

	removeItem(upsaleId: string) {
		var productVariantId = this.route.snapshot.params.id;

		this.removeUpsale(upsaleId).subscribe((res) => {
			if (res) {
				this.upsaleProducts$ = this.dataService
					.query(ListUpsaleByProductDocument, {
						productVariantId,
					})
					.mapStream((data) => {
						return data.listByProduct.items;
					});
			}
		});
	}

	private updateUpsale(
		mainProductVariantId: string,
		selectedVariant: any,
		quantity: number
	) {
		return this.dataService.mutate(AddUpsaleToProductDocument, {
			input: {
				mainProductVariantId,
				productVariantId: selectedVariant.id,
				quantity,
				// options: this.options,
			},
		});
	}

	private removeUpsale(id: string) {
		return this.dataService.mutate(RemoveUpsaleDocument, {
			id,
		});
	}

	private addOptionValue() {
		const options = this.parseInputIntoOptions(this.input).filter((option) => {
			// do not add an option with the same name
			// as an existing option
			const existing = this.options;
			return !existing?.find((o) => o === option);
		});
		console.log({ options });
		if (options) {
			for (const option of options) {
				// this.add.emit(option);
				this.options.push(option);
			}
		} else {
			// this.formValue = unique([...this.formValue, ...options]);
			// this.onChangeFn(this.formValue);
		}
		this.input = "";
	}

	private parseInputIntoOptions(input: string): string[] {
		return input
			.split(/[,\n]/)
			.map((s) => s.trim())
			.filter((s) => s !== "")
			.filter((s) => s.match(/[0-9]+/g) !== null)
			.map((s) => s);
	}

	private removeLastOption() {
		if (this.options.length) {
			const option = this.options[this.options.length - 1];
			this.removeOption(option);
		}
	}
}
