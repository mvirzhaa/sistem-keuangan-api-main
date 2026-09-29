/*
  Warnings:

  - You are about to drop the column `format_kode_transaksi` on the `JenisTransaksi` table. All the data in the column will be lost.
  - Added the required column `formatKodeTransaksi` to the `JenisTransaksi` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "public"."Kelompok" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisUserId" INTEGER NOT NULL,

    CONSTRAINT "Kelompok_pkey" PRIMARY KEY ("id")
);

-- Rename column format_kode_transaksi to formatKodeTransaksi
ALTER TABLE "public"."JenisTransaksi" RENAME COLUMN "format_kode_transaksi" TO "formatKodeTransaksi";


-- CreateIndex
CREATE UNIQUE INDEX "Kelompok_kode_key" ON "public"."Kelompok"("kode");

-- AddForeignKey
ALTER TABLE "public"."Kelompok" ADD CONSTRAINT "Kelompok_jenisUserId_fkey" FOREIGN KEY ("jenisUserId") REFERENCES "public"."JenisUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
