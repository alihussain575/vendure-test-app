import { Injectable } from "@nestjs/common";
import { ID, RequestContext, TransactionalConnection } from "@vendure/core";
import { TemplatePhrase } from "../entities/template-phrase.entity";
import { EmailTemplateService } from "./template.service";
import {TemplatePhraseInput} from "../ui/generated-admin-types" 

@Injectable()
export class TemplatePhraseService {
	private readonly relations = ["template"];

	constructor(
		private connection: TransactionalConnection,
		private templateService: EmailTemplateService
	) {}

	async findAll(ctx: RequestContext) {
		return this.connection.getRepository(ctx, TemplatePhrase).find({});
	}

	async findOne(ctx: RequestContext, id: string) {
		return this.connection.getRepository(ctx, TemplatePhrase).findOne({
			where: { id },
			relations: this.relations,
		});
	}

	async findOneByKey(
		ctx: RequestContext,
		key: string,
		templateId?: ID,
		templateCode?: string
	): Promise<TemplatePhrase | null> {
		const qb = this.connection
			.getRepository(ctx, TemplatePhrase)
			.createQueryBuilder("phrase");
		qb.where("phrase.key = :key", { key });

		if (!templateId && !templateCode) {
			return null;
		}

		if (templateId) {
			qb.andWhere("phrase.templateId = :templateId", { templateId });
		}
		if (templateCode) {
			qb.andWhere("phrase.templateCode = :templateCode", { templateCode });
		}

		return qb.getOne();
	}

	async createOne(ctx: RequestContext, input: any) {
		const templatePhrase = new TemplatePhrase(input);

		const template = await this.templateService.getTemplateByCode(
			ctx,
			input.templateCode
		);

		if (!template) {
			throw new Error(`No template found with code "${input.templateCode}"`);
		}

		templatePhrase.template = template;

		const phrases = await this.connection
			.getRepository(ctx, TemplatePhrase)
			.save(templatePhrase);

		return phrases;
	}

	async updateOne(ctx: RequestContext, input: any) {
		const templatePhrase = await this.findOne(ctx, input.id);

		if (!templatePhrase) {
			return this.createOne(ctx, input);
		}

		const template = await this.templateService.getTemplateByCode(
			ctx,
			input.templateCode
		);

		if (!template) {
			throw new Error(`No template found with code "${input.templateCode}"`);
		}

		const phrases = await this.connection
			.getRepository(ctx, TemplatePhrase)
			.save(templatePhrase);

		return phrases;
	}

	async removeOne(ctx: RequestContext, id: string) {
		const templatePhrase = await this.findOne(ctx, id);

		if (!templatePhrase) {
			throw new Error(`No template phrase found with id "${id}"`);
		}

		await this.connection
			.getRepository(ctx, TemplatePhrase)
			.remove(templatePhrase);

		return true;
	}

	async createMany(ctx: RequestContext, input: any[]) {
		const phrases = await Promise.all([
			...input.map(async (phrase) => await this.createOne(ctx, phrase)),
		]);

		return phrases;
	}

	async updateMany(ctx: RequestContext, input: TemplatePhraseInput[]) {
		const phrases = await Promise.all([
			...input.map(async (phrase) => await this.updateOne(ctx, phrase)),
		]);

		return phrases;
	}
}
