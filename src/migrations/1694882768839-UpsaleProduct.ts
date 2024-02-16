import {MigrationInterface, QueryRunner} from "typeorm";

export class UpsaleProduct1694882768839 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "up_sale" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" integer NOT NULL DEFAULT '1', "quantity" integer NOT NULL DEFAULT '0', "id" SERIAL NOT NULL, "mainProductVariantId" integer, "productVariantId" integer, CONSTRAINT "PK_b48dc9f6fd5d9cf24dec31ee932" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_db6d566499296ee8ea9c967096" ON "up_sale" ("mainProductVariantId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_5ef3f2fd589ef27ef1cd812950" ON "up_sale" ("productVariantId") `, undefined);
        await queryRunner.query(`CREATE TABLE "up_sale_channels_channel" ("upSaleId" integer NOT NULL, "channelId" integer NOT NULL, CONSTRAINT "PK_ca587f4d2c2d2fea33a16c0d9f5" PRIMARY KEY ("upSaleId", "channelId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_13be94eec3f026f9a1d4ec2f3d" ON "up_sale_channels_channel" ("upSaleId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_d52eee17ec89bb9f3c37293c39" ON "up_sale_channels_channel" ("channelId") `, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsMainproductid" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFields__fix_relational_custom_fields__" boolean`, undefined);
        await queryRunner.query(`COMMENT ON COLUMN "order_line"."customFields__fix_relational_custom_fields__" IS 'A work-around needed when only relational custom fields are defined on an entity'`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD CONSTRAINT "FK_e6d603361cb37c7cedbb6962611" FOREIGN KEY ("customFieldsMainproductid") REFERENCES "order_line"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "up_sale" ADD CONSTRAINT "FK_db6d566499296ee8ea9c9670962" FOREIGN KEY ("mainProductVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "up_sale" ADD CONSTRAINT "FK_5ef3f2fd589ef27ef1cd8129501" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "up_sale_channels_channel" ADD CONSTRAINT "FK_13be94eec3f026f9a1d4ec2f3de" FOREIGN KEY ("upSaleId") REFERENCES "up_sale"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "up_sale_channels_channel" ADD CONSTRAINT "FK_d52eee17ec89bb9f3c37293c390" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "up_sale_channels_channel" DROP CONSTRAINT "FK_d52eee17ec89bb9f3c37293c390"`, undefined);
        await queryRunner.query(`ALTER TABLE "up_sale_channels_channel" DROP CONSTRAINT "FK_13be94eec3f026f9a1d4ec2f3de"`, undefined);
        await queryRunner.query(`ALTER TABLE "up_sale" DROP CONSTRAINT "FK_5ef3f2fd589ef27ef1cd8129501"`, undefined);
        await queryRunner.query(`ALTER TABLE "up_sale" DROP CONSTRAINT "FK_db6d566499296ee8ea9c9670962"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP CONSTRAINT "FK_e6d603361cb37c7cedbb6962611"`, undefined);
        await queryRunner.query(`COMMENT ON COLUMN "order_line"."customFields__fix_relational_custom_fields__" IS 'A work-around needed when only relational custom fields are defined on an entity'`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFields__fix_relational_custom_fields__"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsMainproductid"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_d52eee17ec89bb9f3c37293c39"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_13be94eec3f026f9a1d4ec2f3d"`, undefined);
        await queryRunner.query(`DROP TABLE "up_sale_channels_channel"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ef3f2fd589ef27ef1cd812950"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_db6d566499296ee8ea9c967096"`, undefined);
        await queryRunner.query(`DROP TABLE "up_sale"`, undefined);
   }

}
