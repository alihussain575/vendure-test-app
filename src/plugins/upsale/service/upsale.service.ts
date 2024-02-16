import { Injectable } from "@nestjs/common";
import {
	ChannelService,
	ListQueryBuilder,
	ListQueryOptions,
	PaginatedList,
	ProductVariant,
	RequestContext,
	TransactionalConnection,
} from "@vendure/core";
import UpSale from "../entities/upsale.entity";
import {
	AddUpsaleToProductInput,
	UpdateUpsaleInput,
} from "src/generated-admin-types";

@Injectable()
export class UpsaleService {
	private readonly relations = [
		"productVariant",
		"productVariant.featuredAsset",
		"productVariant.product",
	];

	constructor(
		private connection: TransactionalConnection,
		private channelService: ChannelService,
		private listQueryBuilder: ListQueryBuilder
	) {}

	async listByProduct(
		ctx: RequestContext,
		productVariantId: string,
		options?: ListQueryOptions<UpSale>
	): Promise<PaginatedList<UpSale>> {
		return this.listQueryBuilder
			.build(UpSale, options, {
				relations: this.relations,
				channelId: ctx.channelId,
				where: {
					mainProductVariant: { id: productVariantId },
				},
			})
			.getManyAndCount()
			.then(async ([items, totalItems]) => {
				return {
					items,
					totalItems,
				};
			});
	}

	async getUpsale(ctx: RequestContext, id: string): Promise<UpSale | null> {
		return this.connection
			.getRepository(ctx, UpSale)
			.findOne({ where: { id }, relations: this.relations });
	}

	async addUpsaleToProduct(
		ctx: RequestContext,
		input: AddUpsaleToProductInput
	): Promise<UpSale> {
		const mainVariant = await this.connection.getEntityOrThrow(
			ctx,
			ProductVariant,
			input.mainProductVariantId
		);

		if (!mainVariant) {
			throw new Error("Product variant not found");
		}

		const variant = await this.connection.getEntityOrThrow(
			ctx,
			ProductVariant,
			input.productVariantId
		);

		if (!variant) {
			throw new Error("Product variant not found");
		}

		const upsale = await this.getOrCreateUpSale(ctx, mainVariant, variant);
		await this.channelService.assignToCurrentChannel(upsale, ctx);

		upsale.quantity += input.quantity;
		// upsale.options = input.options ?? [];
		await this.connection.getRepository(ctx, UpSale).save(upsale);

		return upsale;
	}

	async updateUpsale(ctx: RequestContext, input: UpdateUpsaleInput) {
		const upsale = await this.connection.getEntityOrThrow(
			ctx,
			UpSale,
			input.id,
			{
				relations: this.relations,
			}
		);

		if (!upsale) {
			throw new Error("Upsale not found");
		}

		upsale.quantity = input.quantity;
		await this.connection.getRepository(ctx, UpSale).save(upsale);

		return upsale;
	}

	async removeUpsale(ctx: RequestContext, id: string): Promise<Boolean> {
		const upsale = await this.connection.getEntityOrThrow(ctx, UpSale, id, {
			relations: this.relations,
		});

		if (!upsale) {
			throw new Error("Upsale not found");
		}

		await this.connection.getRepository(ctx, UpSale).remove(upsale);

		return true;
	}

	private async getOrCreateUpSale(
		ctx: RequestContext,
		mainProductVariant: ProductVariant,
		productVariant: ProductVariant
	) {
		const upsale = await this.connection.getRepository(ctx, UpSale).findOne({
			where: {
				mainProductVariant: { id: mainProductVariant.id },
				productVariant: { id: productVariant.id },
			},
			relations: this.relations,
		});

		if (upsale) {
			return upsale;
		}

		const newUpsale = await this.connection.getRepository(ctx, UpSale).save(
			new UpSale({
				mainProductVariant: mainProductVariant,
				productVariant: productVariant,
				quantity: 0,
				options: [],
			})
		);

		const upsaleWithRelations = await this.connection.getEntityOrThrow(
			ctx,
			UpSale,
			newUpsale.id,
			{
				relations: this.relations,
			}
		);

		return upsaleWithRelations;
	}
}
