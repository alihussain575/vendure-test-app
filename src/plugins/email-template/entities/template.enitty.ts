import { EntityId, ID, VendureEntity } from "@vendure/core";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { TemplatePhrase } from "./template-phrase.entity";

@Entity()
export class EmailTemplate extends VendureEntity {
	constructor(input?: Partial<EmailTemplate>) {
		super(input);
	}

	@EntityId({ nullable: true })
	channelId: ID;

	@Column()
	name: string;

	@Column()
	@Index()
	code: string;

	@Column()
	description: string;

	@Column()
	enabled: boolean;

	@Column()
	@Index()
	type: string; // order | shipping | service-fulfillnment | review | customer | gift-card | email-marketing

	@Column("text")
	template: string;

	@Column()
	templatePath: string;

	@Column()
	subject: string;

	@OneToMany((type) => TemplatePhrase, (phrase) => phrase.template)
	phrases: TemplatePhrase[];

	@Column({ default: false })
	attachFile: boolean;
}
	