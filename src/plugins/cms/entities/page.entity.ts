import { Asset, DeepPartial, VendureEntity } from "@vendure/core";

import { Column, Entity, Index, ManyToOne } from "typeorm";

export enum PageStatus {
	Draft = "draft",
	Published = "published",
}

@Entity()
export class Page extends VendureEntity {
	constructor(input?: DeepPartial<Page>) {
		super(input);
	}

	@Column()
	title: string;

	@Column()
	meta_description: string;

	@Column({ default: "" })
	meta_keyword: string;

	@Column({ default: "" })
	meta_title: string;

	@Column({ default: false })
	show_in_nav: boolean;

	@Column({ default: "footer" })
	nav: string;

	@ManyToOne((type) => Page, {
		nullable: true,
		onDelete: "SET NULL",
	})
	@Index()
	parent: Page;

	@Column()
	@Index()
	slug: string;

	@Column()
	content: string;

	@ManyToOne((type) => Asset, { nullable: true })
	featured_image: Asset;

	@Column({ default: 1 })
	sort_order: number;

	@Column({ default: PageStatus.Draft })
	status: PageStatus;
}
