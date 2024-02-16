import {
	Channel,
	ChannelAware,
	CustomFieldsObject,
	DeepPartial,
	HasCustomFields,
	Product,
	ProductVariant,
	SoftDeletable,
	VendureEntity,
} from "@vendure/core";
import { Entity, ManyToMany, ManyToOne, JoinTable, Column } from "typeorm";

@Entity()
export class Campaign
	extends VendureEntity
	implements ChannelAware, HasCustomFields, SoftDeletable
{
	constructor(input?: DeepPartial<Campaign>) {
		super(input);
	}

	@ManyToMany((type) => Channel)
	@JoinTable()
	channels: Channel[];

	customFields: CustomFieldsObject;

	@Column({ nullable: true, type: Date })
	deletedAt: Date | null;

	@Column()
	name: string;

	@ManyToOne((type) => Product)
	product: Product;

	@ManyToMany((type) => ProductVariant)
	@JoinTable()
	productVariants: ProductVariant[];

	@Column({ default: true })
	active: boolean;

	@Column({ nullable: true, type: "simple-array" })
	defaultVariantIds: string[];

	@Column({ nullable: true })
	header: string;

	@Column({ nullable: true })
	subHeader: string;

	@Column({ nullable: true })
	buttonText: string;
}
