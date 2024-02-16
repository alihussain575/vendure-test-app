import { Injectable } from "@nestjs/common";
import {
	ChannelService,
	ID,
	ListQueryBuilder,
	ListQueryOptions,
	Product,
	ProductService,
	ProductVariant,
	ProductVariantService,
	RequestContext,
	TransactionalConnection,
	assertFound,
} from "@vendure/core";
import { Campaign } from "../entities/campaign.entity";
import { IsNull, In } from "typeorm";
import {
	CreateCampaignInput,
	DeletionResult,
	UpdateCampaignInput,
} from "../ui/generated-admin-types";

@Injectable()
export class CampaignService {
	private relations = ["product", "productVariants"];

	constructor(
		private connection: TransactionalConnection,
		private productService: ProductService,
		private variantService: ProductVariantService,
		private listQueryBuilder: ListQueryBuilder,
		private channelService: ChannelService
	) {}

	async retrieve(ctx: RequestContext, id: string) {
		return this.connection.findOneInChannel(ctx, Campaign, id, ctx.channelId, {
			relations: this.relations,
			where: {
				deletedAt: IsNull(),
			},
		});
	}

	async retrieveByProduct(ctx: RequestContext, productId: string) {
		const campaign = await this.connection
			.getRepository(ctx, Campaign)
			.findOne({
				relations: this.relations,
				where: {
					// channels: { id: ctx.channelId },
					product: { id: productId },
					deletedAt: IsNull(),
					active: true,
				},
				order: { createdAt: "DESC" },
			});

		console.log({ campaign });
		return campaign;
	}

	async list(ctx: RequestContext, options?: ListQueryOptions<Campaign>) {
		return this.listQueryBuilder
			.build(Campaign, options, {
				relations: this.relations,
				where: { deletedAt: IsNull() },
				channelId: ctx.channelId,
			})
			.getManyAndCount()
			.then(([items, totalItems]) => ({
				items,
				totalItems,
			}));
	}

	async create(ctx: RequestContext, input: CreateCampaignInput) {
		const product = await this.productService.findOne(ctx, input.product);

		if (!product) {
			return new Error("Product not found");
		}

		const campaign = await this.connection.getRepository(ctx, Campaign).save(
			new Campaign({
				...input,
				product,
				productVariants: [],
			})
		);
		await this.channelService.assignToCurrentChannel(campaign, ctx);

		await this.connection.getRepository(ctx, Campaign).save(campaign);

		for (const variantId of input.productVariants) {
			const variant = await this.variantService.findOne(ctx, variantId);

			if (!variant) {
				continue;
			}

			campaign.productVariants.push(variant);
		}

		await this.connection.getRepository(ctx, Campaign).save(campaign);

		return campaign;
	}

	async update(ctx: RequestContext, input: UpdateCampaignInput) {
		const campaign = await this.connection.getEntityOrThrow(
			ctx,
			Campaign,
			input.id,
			{
				relations: this.relations,
			}
		);

		if (!campaign) {
			return new Error("Campaign not found");
		}

		const updateValue: Partial<Campaign> = {
			active: input.active,
			defaultVariantIds: input.defaultVariantIds,
			name: input.name,
			header: input.header,
			subHeader: input.subHeader,
			buttonText: input.buttonText,
		};

		await this.connection.getRepository(ctx, Campaign).save(
			{
				id: campaign.id,
				...updateValue,
			},
			{ reload: false }
		);

		if (input.product)
			await this.updateCampaignMainProduct(ctx, campaign, input.product);

		if (input.productVariants)
			// console.log({ campaign });
			await this.updateAddonProducts(ctx, campaign, input.productVariants);

		return assertFound(this.retrieve(ctx, campaign.id.toString()));
	}

	async delete(ctx: RequestContext, id: string) {
		const campaign = await this.connection.getEntityOrThrow(ctx, Campaign, id);
		if (!campaign) return new Error("Campaign not found");

		await this.connection.getRepository(ctx, Campaign).save(
			{
				...campaign,
				deletedAt: new Date(),
			},
			{ reload: false }
		);

		return {
			result: DeletionResult.DELETED,
		};
	}

	async updateAddonProducts(
		ctx: RequestContext,
		campaign: Campaign,
		productVariantIds: (string | number)[]
	) {
		//* filter need to removed variants
		const variants = campaign.productVariants.filter((variant) => {
			return !productVariantIds.includes(variant.id);
		});

		//* remove variants
		for (const variant of variants) {
			const index = campaign.productVariants.indexOf(variant);
			campaign.productVariants.splice(index, 1);
		}

		//* add new variants
		for (const variantId of productVariantIds) {
			if (campaign.productVariants.find((v) => v.id === variantId)) continue;

			const variant = await this.variantService.findOne(ctx, variantId);

			if (!variant) {
				continue;
			}

			campaign.productVariants.push(variant);
		}

		await this.connection.getRepository(ctx, Campaign).save({
			id: campaign.id,
			productVariants: campaign.productVariants,
		});

		return campaign;
	}

	async updateCampaignMainProduct(
		ctx: RequestContext,
		campaign: Campaign,
		productId: string
	) {
		const product = await this.productService.findOne(ctx, productId);

		if (!product) {
			return new Error("Product not found");
		}

		await this.connection.getRepository(ctx, Campaign).save({
			id: campaign.id,
			product,
		});

		return campaign;
	}

	async handleProductEvent(
		ctx: RequestContext,
		type: "created" | "updated" | "deleted",
		product: Product
	) {
		if (type === "deleted") {
			const campaign = await this.connection.getRepository(ctx, Campaign).find({
				where: {
					product: { id: product.id },
					deletedAt: IsNull(),
					channels: { id: ctx.channelId },
				},
			});

			for (const c of campaign) {
				await this.connection
					.getRepository(ctx, Campaign)
					.save({ ...c, deletedAt: new Date() });
			}
		}
	}

	async handleVariantEvent(
		ctx: RequestContext,
		type: "created" | "updated" | "deleted",
		variants: ProductVariant[]
	) {
		if (type === "deleted") {
			const campaigns = await this.listQueryBuilder
				.build(Campaign, undefined, {
					relations: this.relations,
					where: {
						deletedAt: IsNull(),
						productVariants: { id: In(variants.map((v) => v.id)) },
					},
					channelId: ctx.channelId,
				})
				.getMany();

			for (const campaign of campaigns) {
				campaign.productVariants = campaign.productVariants.filter(
					(variant) => !variants.map((v) => v.id).includes(variant.id)
				);

				await this.connection.getRepository(ctx, Campaign).save(campaign);
			}
		}
	}
}
