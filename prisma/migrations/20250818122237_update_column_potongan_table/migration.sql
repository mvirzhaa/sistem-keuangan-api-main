/*
  Warnings:

  - Added the required column `jenisPotongan` to the `Potongan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Potongan" ADD COLUMN     "jenisPotongan" "public"."JenisPotongan" NOT NULL,
ALTER COLUMN "tipePotongan" DROP NOT NULL;
