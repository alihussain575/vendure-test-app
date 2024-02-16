import {MigrationInterface, QueryRunner} from "typeorm";

export class campaign1696304922514 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "campaign" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "defaultVariantId" character varying, "header" character varying, "subHeader" character varying, "buttonText" character varying, "id" SERIAL NOT NULL, "productId" integer, CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "campaign_channels_channel" ("campaignId" integer NOT NULL, "channelId" integer NOT NULL, CONSTRAINT "PK_ac8d73851152126a9ef154c4c67" PRIMARY KEY ("campaignId", "channelId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_fd17c948fec46ce91b80d95311" ON "campaign_channels_channel" ("campaignId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_46aec6d12f320cffc2efd6c3d0" ON "campaign_channels_channel" ("channelId") `, undefined);
        await queryRunner.query(`CREATE TABLE "campaign_product_variants_product_variant" ("campaignId" integer NOT NULL, "productVariantId" integer NOT NULL, CONSTRAINT "PK_8877f6e0604e841770646da3e44" PRIMARY KEY ("campaignId", "productVariantId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_28147de17311d25d242769c73b" ON "campaign_product_variants_product_variant" ("campaignId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_e5404194843a926c22319f0746" ON "campaign_product_variants_product_variant" ("productVariantId") `, undefined);
        await queryRunner.query(`ALTER TABLE "campaign" ADD CONSTRAINT "FK_b7dc708b4b316423aa449ae41e6" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign_channels_channel" ADD CONSTRAINT "FK_fd17c948fec46ce91b80d953118" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign_channels_channel" ADD CONSTRAINT "FK_46aec6d12f320cffc2efd6c3d04" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign_product_variants_product_variant" ADD CONSTRAINT "FK_28147de17311d25d242769c73b7" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign_product_variants_product_variant" ADD CONSTRAINT "FK_e5404194843a926c22319f0746b" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "campaign_product_variants_product_variant" DROP CONSTRAINT "FK_e5404194843a926c22319f0746b"`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign_product_variants_product_variant" DROP CONSTRAINT "FK_28147de17311d25d242769c73b7"`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign_channels_channel" DROP CONSTRAINT "FK_46aec6d12f320cffc2efd6c3d04"`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign_channels_channel" DROP CONSTRAINT "FK_fd17c948fec46ce91b80d953118"`, undefined);
        await queryRunner.query(`ALTER TABLE "campaign" DROP CONSTRAINT "FK_b7dc708b4b316423aa449ae41e6"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5404194843a926c22319f0746"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_28147de17311d25d242769c73b"`, undefined);
        await queryRunner.query(`DROP TABLE "campaign_product_variants_product_variant"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_46aec6d12f320cffc2efd6c3d0"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd17c948fec46ce91b80d95311"`, undefined);
        await queryRunner.query(`DROP TABLE "campaign_channels_channel"`, undefined);
        await queryRunner.query(`DROP TABLE "campaign"`, undefined);
   }

}
