import { Injectable } from "@nestjs/common";
import { CustomerWishlist } from "../entities/customer-wishlist.entity";
import {
	ChannelService,
	Customer,
	ID,
	ListQueryBuilder,
	ListQueryOptions,
	PaginatedList,
	ProductVariant,
	RelationPaths,
	RequestContext,
	TransactionalConnection,
} from "@vendure/core";
import { IsNull } from "typeorm";

@Injectable()
export class WishlistService {
	private readonly relations = [
		"productVariant",
		"productVariant.product",
		"productVariant.featuredAsset",
		"customer",
	];

	constructor(
		private connection: TransactionalConnection,
		private channelService: ChannelService,
		private listQueryBuilder: ListQueryBuilder
	) {}

	private async getCustomerFromUserId(ctx: RequestContext) {
		return this.connection.getRepository(ctx, Customer).findOne({
			where: { user: { id: ctx.activeUserId } },
		});
	}

	async getAllByCustomer(
		ctx: RequestContext,
		options?: ListQueryOptions<CustomerWishlist>,
		relations?: RelationPaths<CustomerWishlist>
	): Promise<PaginatedList<CustomerWishlist>> {
		const customer = await this.getCustomerFromUserId(ctx);

		if (!customer) {
			throw new Error("Customer not found");
		}

		return this.listQueryBuilder
			.build(CustomerWishlist, options, {
				relations: relations || this.relations,
				channelId: ctx.channelId,
				where: {
					customer: { id: customer.id },
					status: 1,
				},
			})
			.getManyAndCount()
			.then(async ([items, totalCount]) => {
				return {
					items,
					totalItems: totalCount,
				};
			});
	}

	async retrieve(
		ctx: RequestContext,
		id: string
	): Promise<CustomerWishlist | undefined> {
		return this.connection.getEntityOrThrow(ctx, CustomerWishlist, id, {
			relations: this.relations,
		});
	}

	async addItem(ctx: RequestContext, productId: string) {
		const customer = await this.getCustomerFromUserId(ctx);

		if (!customer) {
			throw new Error("Customer not found");
		}

		const variant = await this.connection.getEntityOrThrow(
			ctx,
			ProductVariant,
			productId,
			{
				// @ts-ignore
				where: { deletedAt: IsNull() },
			}
		);

		if (!variant) {
			throw new Error("Product variant not found");
		}

		const item = await this.getOrCreateWishlist(ctx, customer, productId);
		await this.channelService.assignToCurrentChannel(item, ctx);

		if (item.status === 0) {
			item.status = 1;
			await this.connection.getRepository(ctx, CustomerWishlist).save(item);
		}

		return item;
	}

	async removeItemById(ctx: RequestContext, wishListId: string) {
		const item = await this.connection.getEntityOrThrow(
			ctx,
			CustomerWishlist,
			wishListId,
			{
				relations: this.relations,
			}
		);
		if (!item) {
			return;
		}

		item.status = 0;
		await this.connection.getRepository(ctx, CustomerWishlist).save(item);

		return true;
	}

	async removeItemByProductVariantId(
		ctx: RequestContext,
		productVariantId: string
	) {
		const customer = await this.getCustomerFromUserId(ctx);

		if (!customer) {
			return;
		}

		const item = await this.connection
			.getRepository(ctx, CustomerWishlist)
			.findOne({
				where: {
					customer: { id: customer.id },
					productVariant: { id: productVariantId },
				},
				relations: this.relations,
			});

		// console.log({ item });

		if (!item) {
			return;
		}

		item.status = 0;
		await this.connection.getRepository(ctx, CustomerWishlist).save(item);

		return item;
	}

	async getByProductVariantId(ctx: RequestContext, productVariantId: string) {
		const customer = await this.getCustomerFromUserId(ctx);

		if (!customer) {
			throw new Error("Customer not found");
		}

		const item = await this.connection
			.getRepository(ctx, CustomerWishlist)
			.findOne({
				where: {
					customer: { id: customer.id },
					productVariant: { id: productVariantId },
				},
				relations: this.relations,
			});

		if (!item) {
			return;
		}

		return item;
	}

	private async getOrCreateWishlist(
		ctx: RequestContext,
		customer: Customer,
		productVariantId: string
	) {
		const item = await this.getWishlistItem(ctx, customer, productVariantId);

		if (item) {
			return item;
		}

		const variant = await this.connection.getEntityOrThrow(
			ctx,
			ProductVariant,
			productVariantId,
			{
				// @ts-ignore
				where: { deletedAt: IsNull() },
				relations: ["product", "featuredAsset"],
			}
		);

		const newWishlist = await this.connection
			.getRepository(ctx, CustomerWishlist)
			.save(
				new CustomerWishlist({
					customer,
					productVariant: variant,
					status: 1,
				})
			);

		const wishlistItem = await this.connection.getEntityOrThrow(
			ctx,
			CustomerWishlist,
			newWishlist.id,
			{
				relations: [
					"customer",
					"productVariant",
					"productVariant.featuredAsset",
					"productVariant.product",
				],
			}
		);

		return wishlistItem;
	}

	private async getWishlistItem(
		ctx: RequestContext,
		customer: Customer,
		productVariantId: string
	) {
		return this.connection.getRepository(ctx, CustomerWishlist).findOne({
			where: {
				customer: { id: customer.id },
				productVariant: { id: productVariantId },
			},
			relations: this.relations,
		});
	}
}
