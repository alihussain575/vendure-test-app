import {MigrationInterface, QueryRunner} from "typeorm";

export class DeleteMessage1699193796241 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_64254033f7462a1839e1c3d1daa"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_64254033f7462a1839e1c3d1daa" FOREIGN KEY ("replyToId") REFERENCES "order_message"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_message" DROP CONSTRAINT "FK_64254033f7462a1839e1c3d1daa"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_message" ADD CONSTRAINT "FK_64254033f7462a1839e1c3d1daa" FOREIGN KEY ("replyToId") REFERENCES "order_message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

}
