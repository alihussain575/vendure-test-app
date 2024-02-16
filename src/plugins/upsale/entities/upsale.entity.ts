import {
	Channel,
	ChannelAware,
	CustomFieldsObject,
	DeepPartial,
	HasCustomFields,
	ProductVariant,
	VendureEntity,
} from "@vendure/core";
import {
	Entity,
	Column,
	ManyToOne,
	Index,
	ManyToMany,
	JoinTable,
} from "typeorm";

@Entity()
export class UpSale
	extends VendureEntity
	implements ChannelAware, HasCustomFields
{
	constructor(input?: DeepPartial<UpSale>) {
		super(input);
	}

	customFields: CustomFieldsObject;

	@ManyToMany((type) => Channel)
	@JoinTable()
	channels: Channel[];

	// main product upsale link to
	@ManyToOne((type) => ProductVariant)
	@Index()
	mainProductVariant: ProductVariant;

	// upsale product info
	@ManyToOne((type) => ProductVariant)
	@Index()
	productVariant: ProductVariant;

	@Column({ default: 1 })
	status: number; // 0: inactive, 1: active

	@Column({ default: 0 })
	quantity: number;

	@Column("simple-array", { nullable: true })
	options: string[];
}

export default UpSale;
