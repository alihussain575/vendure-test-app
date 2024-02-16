import {MigrationInterface, QueryRunner} from "typeorm";

export class addOnOptions1695133259436 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "up_sale" ADD "options" text`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "up_sale" DROP COLUMN "options"`, undefined);
   }

}
