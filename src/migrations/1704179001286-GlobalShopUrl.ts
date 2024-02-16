import {MigrationInterface, QueryRunner} from "typeorm";

export class GlobalShopUrl1704179001286 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "global_settings" ADD "customFieldsShopurl" character varying(255) DEFAULT ''`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "global_settings" DROP COLUMN "customFieldsShopurl"`, undefined);
   }

}
