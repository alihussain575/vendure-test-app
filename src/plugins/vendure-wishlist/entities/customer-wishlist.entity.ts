import {
	CustomFieldsObject,
	DeepPartial,
} from "@vendure/common/lib/shared-types";
import {
	Channel,
	ChannelAware,
	Customer,
	HasCustomFields,
	ProductVariant,
	VendureEntity,
} from "@vendure/core";
import {
	Column,
	Entity,
	Index,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	JoinTable,
} from "typeorm";

export class WishlistCustomFields {}

@Entity()
export class CustomerWishlist
	extends VendureEntity
	implements ChannelAware, HasCustomFields
{
	constructor(input?: DeepPartial<CustomerWishlist>) {
		super(input);
	}

	@ManyToMany((type) => Channel)
	@JoinTable()
	channels: Channel[];

	@Column((type) => WishlistCustomFields)
	customFields: CustomFieldsObject;

	@ManyToOne((type) => Customer, { onDelete: "CASCADE" })
	@Index()
	customer: Customer;

	@ManyToOne(() => ProductVariant, { onDelete: "CASCADE" })
	// @Index()
	productVariant: ProductVariant;

	// 1 = active, 0 = inactive
	@Column({ default: 1 })
	status: number;
}
