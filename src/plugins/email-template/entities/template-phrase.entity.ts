import { DeepPartial, VendureEntity } from "@vendure/core";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { EmailTemplate } from "./template.enitty";

@Entity()
export class TemplatePhrase extends VendureEntity {
	constructor(input?: DeepPartial<TemplatePhrase>) {
		super(input);
	}

	@Column()
	@Index()
	key: string;

	@Column()
	value: string;

	@ManyToOne((type) => EmailTemplate, (template) => template.phrases, {
		onDelete: "CASCADE",
	})
	@Index()
	template: EmailTemplate;
}
