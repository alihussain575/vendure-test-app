import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	OnDestroy,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import {
	LanguageCode,
	TypedBaseDetailComponent,
	ModalService,
	ProductMultiSelectorDialogComponent,
	SearchProductsQuery,
	Product,
	GetProductDetailDocument,
	GetProductDetailQuery,
} from "@vendure/admin-ui/core";
import {
	CampaignFragment,
	CreateCampaignDocument,
	GetCampaignDocument,
	GetCampaignQuery,
	ProductVariant,
	UpdateCampaignDocument,
} from "../generated-admin-types";

import { Subject, Observable, of, firstValueFrom } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";

import { AddonSelectDialog } from "../addon-select-dialog/addon-select-dialog.component";

type CampaignForm = {
	name: string;
	product: string | null;
	productVariants: any[];
	defaultVariants: string[];
	active: boolean;
	header: string;
	subHeader: string;
	buttonText: string;
};

@Component({
	templateUrl: "./campaign-detail.component.html",
	styleUrls: ["./campaign-detail.component.scss"],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class CampaignDetailComponent
	extends TypedBaseDetailComponent<typeof GetCampaignDocument, "campaign">
	implements OnInit, OnDestroy
{
	detailForm = this.formBuilder.group({
		name: "",
		product: "",
		productVariants: [[""]],
		defaultVariants: [[""]],	
		active: true,
		header: "Select Addons",
		subHeader: "",
		buttonText: "Finish",
	});

	selectedProductId$ = new Subject<string | undefined>();
	selectedProduct$: Observable<GetProductDetailQuery["product"]> =
		of(undefined);

	addons$: Observable<any[]>;

	constructor(
		private formBuilder: FormBuilder,
		private modalService: ModalService
	) {
		super();
	}

	ngOnDestroy(): void {
		this.destroy();

		this.selectedProductId$.complete();
	}

	ngOnInit(): void {
		this.init();
		this.selectedProductId$.next(this.entity?.product.id);
		this.addons$ = of([]);

		this.selectedProduct$.subscribe((product) => {
			console.log({ product });
		});

		this.entity$.subscribe((entity) => {
			if (entity) {
				console.log({ entity });
				this.selectedProductId$.next(entity.product.id);
				// this.selectedProductId = entity.product.id;
				this.selectedProduct$ = this.dataService.product
					.getProduct(entity.product.id)
					.mapStream((result) => result.product);

				this.addons$ = of(
					entity.productVariants.reduce((acc: any[], next: any) => {
						const prod = acc.find((p) => p.id === next.product.id);

						if (prod) {
							prod.variants.push(next);
						} else {
							acc.push({
								...next.product,
								variants: [next],
							});
						}

						return [...acc];
					}, [])
				);
			}
		});

		this.selectedProductId$.subscribe((id) => {
			if (id) {
				this.selectedProduct$ = this.dataService.product
					.getProduct(id)
					.mapStream((result) => result.product);
			}
		});
	}

	create() {
		console.log("create");
		this.dataService
			.mutate(CreateCampaignDocument, {
				input: {
					name: this.detailForm.value.name ?? "",
					active: this.detailForm.value.active ?? true,
					product: this.detailForm.value.product ?? "",
					productVariants: this.detailForm.value.productVariants ?? [],
					defaultVariantIds: this.detailForm.value.defaultVariants ?? [],
					header: this.detailForm.value.header ?? "Select Addons",
					subHeader: this.detailForm.value.subHeader ?? "",
					buttonText: this.detailForm.value.buttonText ?? "Finish",
				},
			})
			.subscribe((result) => {
				// console.log({ result });

				this.router.navigate([
					"/extensions",
					"campaign",
					result.createCampaign.id,
				]);
			});
	}

	update() {
		console.log("update");
		this.dataService
			.mutate(UpdateCampaignDocument, {
				input: {
					id: this.id,
					name: this.detailForm.value.name ?? "",
					active: this.detailForm.value.active ?? true,
					header: this.detailForm.value.header ?? undefined,
					subHeader: this.detailForm.value.subHeader ?? undefined,
					buttonText: this.detailForm.value.buttonText ?? undefined,
					productVariants: this.detailForm.value.productVariants ?? [],
					defaultVariantIds: this.detailForm.value.defaultVariants ?? [],
					product: this.detailForm.value.product ?? this.selectedProductId,
				},
			})
			.subscribe((result) => {
				console.log({ result });

				this.detailForm.markAsPristine();
			});
	}

	removeProduct() {
		this.selectedProductId$.next(undefined);
	}

	selectedProductId: string | undefined = undefined;

	openProductSelectDialog() {
		this.modalService
			.fromComponent(ProductMultiSelectorDialogComponent, {
				size: "xl",
				locals: {
					mode: "product",
					initialSelectionIds: [this.selectedProductId ?? ""],
				},
			})
			.subscribe((result) => {
				// console.log({ result });
				// this.selectedProductId$.next(undefined);

				if (!result) return;
				const lastIdx = result.length - 1;
				if (!result[lastIdx].productId) return;

				this.selectedProductId$.next(result[lastIdx].productId);
				// this.setProduct(result[lastIdx].productId);
				this.selectedProductId = result[lastIdx].productId;

				this.detailForm.patchValue({
					product: result[lastIdx].productId,
				});
				this.detailForm.markAsDirty();
			});
	}

	isDefault(variant: ProductVariant) {
		return this.detailForm.value.defaultVariants?.includes(variant.id);
	}

	openSelectAddonDialog() {
		this.modalService
			.fromComponent(AddonSelectDialog, {
				size: "xl",
				locals: {
					initialSelection$: this.addons$,
					initialDefaultVariantIds$: this.entity$.pipe(
						switchMap((entity) => {
							if (!entity) return of([]);

							return of(entity.defaultVariantIds ?? []);
						})
					),
				},
			})
			.subscribe((result) => {
				console.log({ result });

				const { productVariants, defaultVariants } = result;

				const addons = productVariants.reduce((acc: any[], next: any) => {
					const prod = acc.find((p) => p.id === next.product.id);

					if (prod) {
						prod.variants.push(next);
					} else {
						acc.push({
							...next.product,
							variants: [next],
						});
					}

					return [...acc];
				}, []);
				console.log({ addons });
				this.addons$ = of(addons);

				this.detailForm.patchValue({
					productVariants: productVariants.map((variant: any) => variant.id),
					defaultVariants: defaultVariants.map((variant: any) => variant.id),
				});
				// this.detailForm.setValue({
				// 	...this.detailForm.value,
				// 	productVariants: productVariants.map((variant: any) => variant.id),
				// 	defaultVariants: defaultVariants.map((variant: any) => variant.id),
				// });
				this.detailForm.markAsDirty();
			});
	}

	protected setFormValues(
		entity: NonNullable<GetCampaignQuery["campaign"]>,
		languageCode: LanguageCode
	): void {
		this.detailForm.patchValue({
			name: entity.name,
			product: entity.product.id,
			productVariants: entity.productVariants.map((variant) => variant.id),
			active: entity.active,
			header: entity.header ?? "Select Addons",
			subHeader: entity.subHeader ?? "",
			buttonText: entity.buttonText ?? "Finish",
			defaultVariants: entity.defaultVariantIds,
		});
	}
}
