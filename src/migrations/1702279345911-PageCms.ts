import {MigrationInterface, QueryRunner} from "typeorm";

export class PageCms1702279345911 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "page" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "meta_description" character varying NOT NULL, "show_in_nav" boolean NOT NULL DEFAULT false, "slug" character varying NOT NULL, "content" character varying NOT NULL, "sort_order" integer NOT NULL DEFAULT '1', "status" character varying NOT NULL DEFAULT 'draft', "id" SERIAL NOT NULL, "parentId" integer, "featuredImageId" integer, CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_1c6d434d60b856dc8572e7b7b5" ON "page" ("parentId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_875a4ba4aebdc1855dbf176dad" ON "page" ("slug") `, undefined);
        await queryRunner.query(`ALTER TABLE "page" ADD CONSTRAINT "FK_1c6d434d60b856dc8572e7b7b57" FOREIGN KEY ("parentId") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "page" ADD CONSTRAINT "FK_00c82645ebea5665afb5407fe00" FOREIGN KEY ("featuredImageId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "page" DROP CONSTRAINT "FK_00c82645ebea5665afb5407fe00"`, undefined);
        await queryRunner.query(`ALTER TABLE "page" DROP CONSTRAINT "FK_1c6d434d60b856dc8572e7b7b57"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_875a4ba4aebdc1855dbf176dad"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_1c6d434d60b856dc8572e7b7b5"`, undefined);
        await queryRunner.query(`DROP TABLE "page"`, undefined);
   }

}
