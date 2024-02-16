import {MigrationInterface, QueryRunner} from "typeorm";

export class ProductVariantAppearance1702436700993 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsVariantappearance" character varying(255) DEFAULT 'dropdown'`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsVariantappearance"`, undefined);
   }

}
