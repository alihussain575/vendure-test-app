import {MigrationInterface, QueryRunner} from "typeorm";

export class productTypes1707935960286 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_type" DROP COLUMN "repetitions"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_type" ADD "repetitions" jsonb NOT NULL`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_type" DROP COLUMN "repetitions"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_type" ADD "repetitions" character varying NOT NULL`, undefined);
   }

}
