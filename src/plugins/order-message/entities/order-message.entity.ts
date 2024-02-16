import { Entity, Column, ManyToOne, Index, OneToOne } from "typeorm";
import {
	Customer,
	DeepPartial,
	Order,
	User,
	Administrator,
	VendureEntity,
	SoftDeletable,
} from "@vendure/core";

@Entity()
export class OrderMessage extends VendureEntity implements SoftDeletable {
	constructor(input?: DeepPartial<OrderMessage>) {
		super(input);
	}

	deletedAt: Date | null;

	@Column()
	type: string; // email, sms, whatsapp, etc

	@ManyToOne((type) => Order, { onDelete: "CASCADE" })
	@Index()
	order: Order;

	@ManyToOne((type) => User, { onDelete: "SET NULL" })
	@Index()
	createdBy: User;

	@ManyToOne((type) => User, { onDelete: "SET NULL" })
	@Index()
	toUser: User;

	@Column({ default: 1 })
	status: number; // default: 1: not read, 0: inactive, 2: read

	@Column("text")
	subject: string;

	@Column()
	to: string; // customer email / phone number

	@Column()
	from: string;

	@Column("text")
	message: string;

	@ManyToOne((type) => OrderMessage, { nullable: true, onDelete: "SET NULL" })
	replyTo: OrderMessage;
}
