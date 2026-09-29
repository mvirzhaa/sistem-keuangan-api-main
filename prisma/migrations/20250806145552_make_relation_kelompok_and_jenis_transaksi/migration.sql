/*
  Warnings:

  - Added the required column `jenisTransaksiId` to the `Kelompok` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Kelompok" ADD COLUMN     "jenisTransaksiId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Kelompok" ADD CONSTRAINT "Kelompok_jenisTransaksiId_fkey" FOREIGN KEY ("jenisTransaksiId") REFERENCES "public"."JenisTransaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
