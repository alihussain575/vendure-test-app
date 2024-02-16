import {MigrationInterface, QueryRunner} from "typeorm";

export class OrderMessageReply1698937449084 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_42d0593a2bef850487f7b5827f7"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_1bd79ec22a0c83f31a76a1ac733"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_1bd79ec22a0c83f31a76a1ac73"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP COLUMN "toCustomerId"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP COLUMN "fromUserId"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD "createdById" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD "toUserId" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD "replyToId" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ALTER COLUMN "status" SET DEFAULT '1'`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_077bce61d122eae58056b8f5d6" ON "order_message" ("createdById") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_ed02b6579c34025a5d25a5454c" ON "order_message" ("toUserId") `, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_077bce61d122eae58056b8f5d61" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_ed02b6579c34025a5d25a5454cf" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_64254033f7462a1839e1c3d1daa" FOREIGN KEY ("replyToId") REFERENCES "order_message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_64254033f7462a1839e1c3d1daa"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_ed02b6579c34025a5d25a5454cf"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_077bce61d122eae58056b8f5d61"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_ed02b6579c34025a5d25a5454c"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_077bce61d122eae58056b8f5d6"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ALTER COLUMN "status" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP COLUMN "replyToId"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP COLUMN "toUserId"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP COLUMN "createdById"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD "fromUserId" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD "toCustomerId" integer`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_1bd79ec22a0c83f31a76a1ac73" ON "order_message" ("fromUserId") `, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_1bd79ec22a0c83f31a76a1ac733" FOREIGN KEY ("fromUserId") REFERENCES "administrator"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_42d0593a2bef850487f7b5827f7" FOREIGN KEY ("toCustomerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
   }

}
