import {MigrationInterface, QueryRunner} from "typeorm";

export class EmailTemplate1701919652244 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "email_template" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying NOT NULL, "enabled" boolean NOT NULL, "type" character varying NOT NULL, "template" text NOT NULL, "templatePath" character varying NOT NULL, "subject" character varying NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "PK_c90815fd4ca9119f19462207710" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_75bd34e96cde646bb118a6c267" ON "email_template" ("code") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_97344a0cde4fb739c90d59a3eb" ON "email_template" ("type") `, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "public"."IDX_97344a0cde4fb739c90d59a3eb"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_75bd34e96cde646bb118a6c267"`, undefined);
        await queryRunner.query(`DROP TABLE "email_template"`, undefined);
   }

}
