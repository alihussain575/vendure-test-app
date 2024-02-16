import {MigrationInterface, QueryRunner} from "typeorm";

export class TemplateAttachFile1705225525436 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "email_template" ADD "attachFile" boolean NOT NULL DEFAULT false`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "email_template" DROP COLUMN "attachFile"`, undefined);
   }

}
