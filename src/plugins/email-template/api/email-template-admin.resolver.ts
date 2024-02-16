import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Ctx, RequestContext, Transaction } from "@vendure/core";
import { EmailTemplateService } from "../services/template.service";

@Resolver()
export class EmailTemplateAdminResolver {
	constructor(private emailTemplateService: EmailTemplateService) {}

	@Query()
	async emailTemplates(@Ctx() ctx: RequestContext) {
		return this.emailTemplateService.getTemplates(ctx);
	}

	@Query()
	async emailTemplate(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.emailTemplateService.getTemplate(ctx, args.id);
	}

	@Query()
	async emailTemplateByCode(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.emailTemplateService.getTemplateByCode(ctx, args.code);
	}

	@Transaction()
	@Mutation()
	async updateEmailTemplate(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.emailTemplateService.updateTemplate(ctx, args.input);
	}

	@Transaction()
	@Mutation()
	async resetDefaultTemplate(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.emailTemplateService.resetDefaultTemplate(ctx, args.code);
	}

	@Query()
	async partials(@Ctx() ctx: RequestContext) {
		return this.emailTemplateService.getPartial(ctx);
	}

	@Mutation()
	async sendTestEmail(@Ctx() ctx: RequestContext, @Args() args: any) {
		return this.emailTemplateService.sendTestEmail(ctx, args.input);
	}
}
