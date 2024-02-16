import { Injectable } from "@nestjs/common";
import { DeletionResult } from "@vendure/common/lib/generated-types";
import {
	ListQueryBuilder,
	ListQueryOptions,
	PaginatedList,
	RelationPaths,
	RequestContext,
	TransactionalConnection,
	assertFound,
} from "@vendure/core";
import { Page, PageStatus } from "../entities/page.entity";
import {
	CreatePageInput,
	DeletionResponse,
	UpdatePageInput,
} from "../ui/generated-admin-types";

@Injectable()
export class CmsService {
	private readonly relations = ["parent", "featured_image"];

	constructor(
		private connection: TransactionalConnection,
		private listQueryBuilder: ListQueryBuilder
	) {}

	async getPages(
		ctx: RequestContext,
		options?: ListQueryOptions<Page>,
		relations?: RelationPaths<Page>
	): Promise<PaginatedList<Page>> {
		const affectRelations = relations ? relations : this.relations;

		return this.listQueryBuilder
			.build(Page, options, {
				relations: affectRelations,
				ctx,
				orderBy: { sort_order: "ASC", createdAt: "DESC" },
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({
				items,
				totalItems,
			}));
	}

	async getPageBySlug(
		ctx: RequestContext,
		slug: string,
		relations?: RelationPaths<Page>
	): Promise<Page | null> {
		const affectRelations = relations ? relations : this.relations;

		return this.connection
			.getRepository(ctx, Page)
			.findOne({
				where: { slug },
				relations: affectRelations,
				order: { sort_order: "ASC", createdAt: "DESC" },
			})
			.then((page) => page);
	}

	async getPage(
		ctx: RequestContext,
		id: string,
		relations?: RelationPaths<Page>
	): Promise<Page | null> {
		const affectRelations = relations ? relations : this.relations;

		return this.connection
			.getRepository(ctx, Page)
			.findOne({
				where: { id },
				relations: affectRelations,
			})
			.then((page) => page);
	}

	async createPage(ctx: RequestContext, input: CreatePageInput): Promise<Page> {
		const page = new Page({
			...input,
			status:
				input.status === "published" ? PageStatus.Published : PageStatus.Draft,
		});

		if (input.parent_id) {
			const parent = await this.getPage(ctx, input.parent_id);

			if (parent) {
				page.parent = parent;
			}
		}

		await this.connection.getRepository(ctx, Page).save(page);

		return assertFound(this.getPage(ctx, page.id.toString()));
	}

	async updatePage(ctx: RequestContext, input: UpdatePageInput): Promise<Page> {
		const page = await this.getPage(ctx, input.id);

		if (!page) {
			throw new Error(`Page with id ${input.id} not found`);
		}

		let parentPage = undefined;

		if (input.parent_id) {
			parentPage = await this.getPage(ctx, input.parent_id);

			if (!parentPage) {
				parentPage = undefined;
			}
		}

		const updatedPage = await this.connection.getRepository(ctx, Page).save(
			{
				...input,
				status:
					input.status === "published"
						? PageStatus.Published
						: PageStatus.Draft,
				parent: parentPage,
			},
			{ reload: false }
		);

		return assertFound(this.getPage(ctx, input.id));
	}

	async deletePage(ctx: RequestContext, id: string): Promise<DeletionResponse> {
		await this.connection.getRepository(ctx, Page).delete(id);

		return {
			result: DeletionResult.DELETED,
		};
	}
}
