import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild,
} from "@angular/core";

import { FormBuilder } from "@angular/forms";
import {
	LanguageCode,
	SharedModule,
	TypedBaseDetailComponent,
} from "@vendure/admin-ui/core";
import { kebabCase } from "lodash";
import { Observable, map, of } from "rxjs";
import {
	CreatePageDocument,
	GetPageDocument,
	GetPagesDocument,
	GetPagesQuery,
	PageFragment,
	UpdatePageDocument,
} from "../generated-admin-types";

@Component({
	templateUrl: `./page-detail.component.html`,
	// styleUrls: ["./page-detail.component.scss"],
	standalone: true,
	imports: [SharedModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDetailComponent
	extends TypedBaseDetailComponent<typeof GetPageDocument, "page">
	implements OnInit, OnDestroy
{
	detailForm = this.formBuilder.group<{
		title: string[];
		slug: string[];
		content: string[];
		sort_order: number[];
		status: boolean[];
		parent: string[];
		meta_description: string[];
		show_in_nav: boolean[];
		nav: string[];
		meta_title: string[];
		meta_keyword: string[];
	}>({
		title: [""],
		slug: [""],
		content: [""],
		sort_order: [1],
		status: [false],
		parent: [""],
		meta_description: [""],
		show_in_nav: [false],
		nav: ["footer"],
		meta_title: [""],
		meta_keyword: [""],
	});

	@ViewChild("textArea", { static: true })
	textArea: ElementRef<HTMLTextAreaElement>;

	input = "";
	isFocussed = false;
	pages$: Observable<GetPagesQuery["pages"]["items"]>;

	protected setFormValues(
		entity: PageFragment,
		languageCode: LanguageCode
	): void {
		this.detailForm.patchValue({
			title: entity.title,
			slug: entity.slug,
			content: entity.content,
			sort_order: entity.sort_order,
			status: entity.status === "published" ? true : false,
			parent: entity.parent?.id ?? "",
			meta_description: entity.meta_description,
			show_in_nav: entity.show_in_nav,
			nav: entity.nav,
			meta_title: entity.meta_title,
			meta_keyword: entity.meta_keyword,
		});
	}

	constructor(private formBuilder: FormBuilder) {
		super();
	}

	ngOnInit() {
		this.init();

		const title = this.detailForm.get("title")?.valueChanges || of(null);
		title.subscribe((value) => {
			if (this.isNew$) {
				this.detailForm.patchValue({
					slug: kebabCase(value ?? ""),
				});
			}
		});

		this.pages$ = this.dataService
			.query(GetPagesDocument)
			.mapStream((data) => data.pages.items)
			.pipe(map((pages) => pages.filter((page) => page.id !== this.id)));
	}

	ngOnDestroy() {
		this.destroy();
	}

	create() {
		this.dataService
			.mutate(CreatePageDocument, {
				input: {
					title: this.detailForm.value.title ?? "",
					slug: this.detailForm.value.slug ?? "",
					content: this.detailForm.value.content ?? "",
					sort_order: this.detailForm.value.sort_order ?? 1,
					status: this.detailForm.value.status ? "published" : "draft",
					parent_id: this.detailForm.value.parent ?? "",
					meta_description: this.detailForm.value.meta_description ?? "",
					show_in_nav: this.detailForm.value.show_in_nav ?? false,
					nav: this.detailForm.value.nav ?? "footer",
					meta_title: this.detailForm.value.meta_title ?? "",
					meta_keyword: this.detailForm.value.meta_keyword ?? "",
				},
			})
			.subscribe((result) => {
				this.detailForm.markAsPristine();

				if (result.createPage.__typename === "Page") {
					const id = result.createPage.id;
					this.router.navigate(["..", id], {
						relativeTo: this.route,
					});
				}
			});
	}

	update() {
		console.log(this.detailForm.value.parent);
		this.dataService
			.mutate(UpdatePageDocument, {
				input: {
					id: this.route.snapshot.params.id ?? "",
					title: this.detailForm.value.title ?? "",
					slug: this.detailForm.value.slug ?? "",
					content: this.detailForm.value.content ?? "",
					sort_order: this.detailForm.value.sort_order ?? 0,
					status: this.detailForm.value.status ? "published" : "draft",
					parent_id: this.detailForm.value.parent ?? "",
					meta_description: this.detailForm.value.meta_description ?? "",
					show_in_nav: this.detailForm.value.show_in_nav ?? false,
					nav: this.detailForm.value.nav ?? "footer",
					meta_title: this.detailForm.value.meta_title ?? "",
					meta_keyword: this.detailForm.value.meta_keyword ?? "",
				},
			})
			.subscribe(() => {
				this.detailForm.markAsPristine();
			});
	}
}
