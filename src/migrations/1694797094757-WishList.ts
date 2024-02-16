import {MigrationInterface, QueryRunner} from "typeorm";

export class WishList1694797094757 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "customer_wishlist" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "customerId" integer, "productVariantId" integer, CONSTRAINT "PK_ed96aa1b01b069d615fab00fb18" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_408d91d17d1456a3d8ee595a41" ON "customer_wishlist" ("customerId") `, undefined);
        await queryRunner.query(`CREATE TABLE "customer_wishlist_channels_channel" ("customerWishlistId" integer NOT NULL, "channelId" integer NOT NULL, CONSTRAINT "PK_1877acfb4fdb8cf8268ed06bbe4" PRIMARY KEY ("customerWishlistId", "channelId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_e9df3698b3efc5c96c9343c504" ON "customer_wishlist_channels_channel" ("customerWishlistId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_50775f2967e1f6c406c64f991a" ON "customer_wishlist_channels_channel" ("channelId") `, undefined);
        await queryRunner.query(`ALTER TABLE "customer_wishlist" ADD CONSTRAINT "FK_408d91d17d1456a3d8ee595a41f" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_wishlist" ADD CONSTRAINT "FK_83484bf7d7e896e3b987a2bc740" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_wishlist_channels_channel" ADD CONSTRAINT "FK_e9df3698b3efc5c96c9343c504a" FOREIGN KEY ("customerWishlistId") REFERENCES "customer_wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_wishlist_channels_channel" ADD CONSTRAINT "FK_50775f2967e1f6c406c64f991ac" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "customer_wishlist_channels_channel" DROP CONSTRAINT "FK_50775f2967e1f6c406c64f991ac"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_wishlist_channels_channel" DROP CONSTRAINT "FK_e9df3698b3efc5c96c9343c504a"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_wishlist" DROP CONSTRAINT "FK_83484bf7d7e896e3b987a2bc740"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer_wishlist" DROP CONSTRAINT "FK_408d91d17d1456a3d8ee595a41f"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_50775f2967e1f6c406c64f991a"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9df3698b3efc5c96c9343c504"`, undefined);
        await queryRunner.query(`DROP TABLE "customer_wishlist_channels_channel"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_408d91d17d1456a3d8ee595a41"`, undefined);
        await queryRunner.query(`DROP TABLE "customer_wishlist"`, undefined);
   }

}
