import {MigrationInterface, QueryRunner} from "typeorm";

export class TemplatePhrases1703910951888 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "template_phrase" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "key" character varying NOT NULL, "value" character varying NOT NULL, "id" SERIAL NOT NULL, "templateId" integer, CONSTRAINT "PK_f7697212961a1bd60fe41b2d8b7" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_dcd4c00608b1f25580d5e243d6" ON "template_phrase" ("key") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_19d40651df2a215794d175ba99" ON "template_phrase" ("templateId") `, undefined);
        await queryRunner.query(`ALTER TABLE "template_phrase" ADD CONSTRAINT "FK_19d40651df2a215794d175ba993" FOREIGN KEY ("templateId") REFERENCES "email_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "template_phrase" DROP CONSTRAINT "FK_19d40651df2a215794d175ba993"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_19d40651df2a215794d175ba99"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_dcd4c00608b1f25580d5e243d6"`, undefined);
        await queryRunner.query(`DROP TABLE "template_phrase"`, undefined);
   }

}
