import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateVersion1701664289297 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "promotion" ADD "usageLimit" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "facet_value" DROP CONSTRAINT "FK_d101dc2265a7341be3d94968c5b"`, undefined);
        await queryRunner.query(`ALTER TABLE "facet_value" ALTER COLUMN "facetId" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "facet_value" ADD CONSTRAINT "FK_d101dc2265a7341be3d94968c5b" FOREIGN KEY ("facetId") REFERENCES "facet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "facet_value" DROP CONSTRAINT "FK_d101dc2265a7341be3d94968c5b"`, undefined);
        await queryRunner.query(`ALTER TABLE "facet_value" ALTER COLUMN "facetId" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "facet_value" ADD CONSTRAINT "FK_d101dc2265a7341be3d94968c5b" FOREIGN KEY ("facetId") REFERENCES "facet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "promotion" DROP COLUMN "usageLimit"`, undefined);
   }

}
