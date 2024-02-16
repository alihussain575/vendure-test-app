import {
	Component,
	OnInit,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
} from "@angular/core";
import {
	Dialog,
	SearchProductsQuery,
	SelectionManager,
	DataService,
	GetProductListQuery,
} from "@vendure/admin-ui/core";
import { PaginationInstance } from "ngx-pagination";
import { Observable, BehaviorSubject, combineLatest } from "rxjs";
import { tap, map } from "rxjs/operators";
import {
	ListProductDocument,
	Product,
	ProductListOptions,
	ProductVariant,
} from "../generated-admin-types";

export type SearchItem = SearchProductsQuery["search"]["items"][number];

@Component({
	templateUrl: "./addon-select-dialog.component.html",
	styleUrls: ["./addon-select-dialog.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddonSelectDialog implements OnInit, Dialog<any> {
	selectionManager: SelectionManager<Product>;
	facetValues$: Observable<SearchProductsQuery["search"]["facetValues"]>;
	searchTerm$ = new BehaviorSubject<string>("");
	searchFacetValueIds$ = new BehaviorSubject<string[]>([]);
	items$: Observable<GetProductListQuery["products"]["items"]>;
	paginationConfig: PaginationInstance = {
		currentPage: 1,
		itemsPerPage: 25,
		totalItems: 1,
	};

	initialSelection$: Observable<Product[]>;
	initialDefaultVariantIds$: Observable<string[]>;

	productVariants: SelectionManager<ProductVariant>;
	defaultVariants: SelectionManager<ProductVariant>;

	resolveWith: (result?: any) => void;
	private paginationConfig$ = new BehaviorSubject<PaginationInstance>(
		this.paginationConfig
	);

	constructor(
		private dataService: DataService,
		private changeDetector: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		const idFn = (a: Product, b: Product) => a.id === b.id;

		this.selectionManager = new SelectionManager<Product>({
			multiSelect: true,
			itemsAreEqual: idFn,
			additiveMode: true,
		});
		this.productVariants = new SelectionManager<ProductVariant>({
			multiSelect: true,
			itemsAreEqual: (a, b) => a.id === b.id,
			additiveMode: true,
		});
		this.defaultVariants = new SelectionManager<ProductVariant>({
			multiSelect: true,
			additiveMode: true,
			itemsAreEqual(a, b) {
				return a.id === b.id && a.product.id === b.product.id;
			},
		});

		const searchQueryResult = this.dataService.query(ListProductDocument, {
			options: {
				take: this.paginationConfig.itemsPerPage,
				skip: 0,
			},
		});
		const result$ = combineLatest(
			this.searchTerm$,
			this.searchFacetValueIds$,
			this.paginationConfig$
		).subscribe(([term, facetValueIds, pagination]) => {
			const take = +pagination.itemsPerPage;
			const skip = (pagination.currentPage - 1) * take;
			var options: ProductListOptions = {
				take,
				skip,
			};
			if (term !== "") {
				options = {
					...options,
					filter: { name: { contains: term } },
				};
			}
			if (facetValueIds.length) {
				options = {
					...options,
					filter: {
						...options.filter,
						facetValueId: { in: [...facetValueIds] },
					},
				};
			}
			return searchQueryResult.ref.refetch({
				options,
			});
		});

		this.items$ = searchQueryResult.stream$.pipe(
			tap((data) => {
				this.paginationConfig.totalItems = data.products.totalItems;
				this.selectionManager.setCurrentItems(
					// @ts-ignore
					data.products.items.map((i) => ({ id: i.id }))
				);
			}),
			map((data) => data.products.items)
		);

		// this.facetValues$ = searchQueryResult.stream$.pipe(
		// 	map((data) => data.products.facetValues)
		// );

		this.initialSelection$.subscribe((addons) => {
			const products: Product[] = [];

			addons.forEach((addon) => {
				this.dataService.product
					.getProduct(addon.id)
					.single$.subscribe((result) => {
						// console.log({ result });
						if (result.product) {
							// console.log(result);
							// this.selectionManager.selectMultiple([result.product as Product]);
							products.push(result.product as Product);

							addon.variants.forEach((variant) => {
								this.productVariants.toggleSelection({
									...variant,
									product: result.product as Product,
								});
							});
						}

						this.changeDetector.markForCheck();
					});
			});

			this.selectionManager.selectMultiple(products);
		});

		this.productVariants.selectionChanges$.subscribe((changes) => {
			// console.log({ changes });
			this.initialDefaultVariantIds$.subscribe((ids) => {
				// console.log({ ids });
				// console.log(changes);
				const variants = changes.filter((v) => ids.includes(v.id));

				// console.log({ variants });
				variants.forEach((variant) => {
					this.defaultVariants.toggleSelection(variant);
				});

				this.changeDetector.markForCheck();
			});
		});

		// console.table(this.productVariants.selection);
		this.selectionManager.selectionChanges$.subscribe((changes) => {
			const varProducts = this.productVariants.selection.map((v) => v.product);

			const removeProduct = varProducts.filter(
				(p) => !changes.map((c) => c.id).includes(p.id)
			);

			const selections = this.productVariants.selection.filter((v) =>
				removeProduct.map((p) => p.id).includes(v.product.id)
			);

			selections.forEach((selection) => {
				this.productVariants.toggleSelection(selection);
			});
		});
	}

	pageChange(page: number) {
		this.paginationConfig.currentPage = page;
		this.paginationConfig$.next(this.paginationConfig);
	}

	itemsPerPageChange(itemsPerPage: number) {
		this.paginationConfig.itemsPerPage = itemsPerPage;
		this.paginationConfig$.next(this.paginationConfig);
	}

	isSelected(item: Product): boolean {
		//  @ts-ignore
		return this.selectionManager.isSelected({ id: item.id });
	}
	isSelectable(item: Product): boolean {
		return !!item.optionGroups.find((g) =>
			g.name.toLowerCase().includes("repetition")
		);
	}

	async toggleSelection(item: Product, event: MouseEvent) {
		// const result = await this.dataService.product
		// 	.getProduct(item.id)
		// 	.ref.result();
		// if (!result.data.product) return;

		if (
			!item.optionGroups.find((g) =>
				g.name.toLowerCase().includes("repetition")
			)
		) {
			return;
		}

		this.selectionManager.toggleSelection(item, event);
	}

	setSearchTerm(term: string) {
		this.searchTerm$.next(term);
	}
	setFacetValueIds(ids: string[]) {
		this.searchFacetValueIds$.next(ids);
	}

	onSelectVariant(variant: ProductVariant, product: Product) {
		this.productVariants.toggleSelection({ ...variant, product });
	}

	isVariantSelected(variant: ProductVariant) {
		return this.productVariants.isSelected(variant);
	}

	onSelectDefaultVariant(variant: ProductVariant, product: Product) {
		if (this.defaultVariants.isSelected(variant)) return;

		const sameProd = this.defaultVariants.selection.find(
			(v) => v.product.id === product.id
		);
		// console.log({ sameProd, variant });
		if (sameProd) {
			this.defaultVariants.toggleSelection(sameProd);
		}
		this.defaultVariants.toggleSelection({ ...variant, product });
	}

	isDefaultSelected(variant: ProductVariant, item: Product) {
		return this.defaultVariants.isSelected({ ...variant, product: item });
	}

	select() {
		this.resolveWith({
			productVariants: this.productVariants.selection,
			defaultVariants: this.defaultVariants.selection,
		});
	}

	cancel() {
		this.resolveWith();
	}
}
