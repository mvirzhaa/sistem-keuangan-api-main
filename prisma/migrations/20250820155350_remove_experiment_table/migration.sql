/*
  Warnings:

  - You are about to drop the `RekananTestTableUhuy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RekananTestTableUhuy" DROP CONSTRAINT "RekananTestTableUhuy_rekananId_fkey";

-- DropTable
DROP TABLE "public"."RekananTestTableUhuy";
