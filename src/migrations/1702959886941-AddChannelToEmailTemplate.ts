import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChannelToEmailTemplate1702959886941
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query(
			`ALTER TABLE "email_template" ADD "channelId" integer`,
			undefined
		);
	}

	public async down(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query(
			`ALTER TABLE "email_template" DROP COLUMN "channelId"`,
			undefined
		);
	}
}
