import {MigrationInterface, QueryRunner} from "typeorm";

export class SendGridConfig1703057105753 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "global_settings" ADD "customFieldsSendgridtoken" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "global_settings" ADD "customFieldsSendgridfrom" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "global_settings" DROP COLUMN "customFieldsSendgridfrom"`, undefined);
        await queryRunner.query(`ALTER TABLE "global_settings" DROP COLUMN "customFieldsSendgridtoken"`, undefined);
   }

}
