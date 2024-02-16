import {MigrationInterface, QueryRunner} from "typeorm";

export class PageNavigation1702973438141 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "page" ADD "meta_keyword" character varying NOT NULL DEFAULT ''`, undefined);
        await queryRunner.query(`ALTER TABLE "page" ADD "meta_title" character varying NOT NULL DEFAULT ''`, undefined);
        await queryRunner.query(`ALTER TABLE "page" ADD "nav" character varying NOT NULL DEFAULT 'footer'`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "nav"`, undefined);
        await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "meta_title"`, undefined);
        await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "meta_keyword"`, undefined);
   }

}
