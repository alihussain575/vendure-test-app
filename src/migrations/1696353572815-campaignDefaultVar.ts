import {MigrationInterface, QueryRunner} from "typeorm";

export class campaignDefaultVar1696353572815 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "campaign" RENAME COLUMN "defaultVariantId" TO "defaultVariantIds"`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign" DROP COLUMN "defaultVariantIds"`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign" ADD "defaultVariantIds" text`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "campaign" DROP COLUMN "defaultVariantIds"`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign" ADD "defaultVariantIds" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign" RENAME COLUMN "defaultVariantIds" TO "defaultVariantId"`, undefined);
   }

}
