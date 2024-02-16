import {MigrationInterface, QueryRunner} from "typeorm";

export class ProductOptionAppearance1705575793247 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsVariantappearance"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_option" ADD "customFieldsIsdefault" boolean DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "product_option_group" ADD "customFieldsAppearance" character varying(255) DEFAULT 'dropdown'`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_option_group" DROP COLUMN "customFieldsAppearance"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_option" DROP COLUMN "customFieldsIsdefault"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsVariantappearance" character varying(255) DEFAULT 'dropdown'`, undefined);
   }

}
