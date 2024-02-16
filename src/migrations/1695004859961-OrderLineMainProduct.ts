import {MigrationInterface, QueryRunner} from "typeorm";

export class OrderLineMainProduct1695004859961 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" RENAME COLUMN "customFields__fix_relational_custom_fields__" TO "customFieldsMainproductname"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsMainproductname"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsMainproductname" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsMainproductname"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsMainproductname" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" RENAME COLUMN "customFieldsMainproductname" TO "customFields__fix_relational_custom_fields__"`, undefined);
   }

}
