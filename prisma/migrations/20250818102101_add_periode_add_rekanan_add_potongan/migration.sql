-- CreateEnum
CREATE TYPE "public"."JenisPotongan" AS ENUM ('POTONGAN', 'BEASISWA');

-- CreateEnum
CREATE TYPE "public"."TipePotongan" AS ENUM ('POTONGAN_RATA', 'POTONGAN_AWAL');

-- CreateTable
CREATE TABLE "public"."Periode" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "namaPeriode" TEXT NOT NULL,
    "tanggalAwalKuliah" TIMESTAMP(3),
    "tanggalAkhirKuliah" TIMESTAMP(3),
    "tanggalAwalPembayaran" TIMESTAMP(3),
    "tanggalAkhirPembayaran" TIMESTAMP(3),
    "isAktif" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Periode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rekanan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kota" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rekanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Potongan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "periodeAwalId" INTEGER,
    "periodeAkhirId" INTEGER,
    "nominal" INTEGER NOT NULL,
    "anggaran" INTEGER NOT NULL,
    "rekananId" INTEGER,
    "jumlahPenerima" INTEGER,
    "realisasi" INTEGER,
    "isMemotongTagihan" BOOLEAN NOT NULL DEFAULT false,
    "tipePotongan" "public"."TipePotongan" NOT NULL,

    CONSTRAINT "Potongan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Periode_kode_key" ON "public"."Periode"("kode");

-- AddForeignKey
ALTER TABLE "public"."Potongan" ADD CONSTRAINT "Potongan_periodeAwalId_fkey" FOREIGN KEY ("periodeAwalId") REFERENCES "public"."Periode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Potongan" ADD CONSTRAINT "Potongan_periodeAkhirId_fkey" FOREIGN KEY ("periodeAkhirId") REFERENCES "public"."Periode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Potongan" ADD CONSTRAINT "Potongan_rekananId_fkey" FOREIGN KEY ("rekananId") REFERENCES "public"."Rekanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
