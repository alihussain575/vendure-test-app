import {MigrationInterface, QueryRunner} from "typeorm";

export class OrderMessage1698649198539 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "order_message" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "status" integer NOT NULL, "subject" text NOT NULL, "to" character varying NOT NULL, "from" character varying NOT NULL, "message" text NOT NULL, "id" SERIAL NOT NULL, "orderId" integer, "fromUserId" integer, "toCustomerId" integer, CONSTRAINT "PK_ca42c8faf6aebd40048957e3710" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_ed49fcbf61b51e2e9087e44abe" ON "order_message" ("orderId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_1bd79ec22a0c83f31a76a1ac73" ON "order_message" ("fromUserId") `, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_ed49fcbf61b51e2e9087e44abee" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_1bd79ec22a0c83f31a76a1ac733" FOREIGN KEY ("fromUserId") REFERENCES "administrator"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_42d0593a2bef850487f7b5827f7" FOREIGN KEY ("toCustomerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_42d0593a2bef850487f7b5827f7"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_1bd79ec22a0c83f31a76a1ac733"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_ed49fcbf61b51e2e9087e44abee"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_1bd79ec22a0c83f31a76a1ac73"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_ed49fcbf61b51e2e9087e44abe"`, undefined);
        await queryRunner.query(`DROP TABLE "order_message"`, undefined);
   }

}
