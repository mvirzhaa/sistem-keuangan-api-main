-- CreateEnum
CREATE TYPE "public"."JenisBiayaNeofeeder" AS ENUM ('BIAYA_MASUK', 'BIAYA_SEMESTER', 'TIDAK_DILAPORKAN');

-- CreateTable
CREATE TABLE "public"."JenisTagihan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "namaJenisTagihan" TEXT NOT NULL,
    "kelompokId" INTEGER NOT NULL,
    "jenisBiayaNeofeeder" "public"."JenisBiayaNeofeeder",
    "frekuensiId" INTEGER NOT NULL,
    "eventKegiatanAkademikId" INTEGER,
    "isMahasiswa" BOOLEAN NOT NULL DEFAULT false,
    "isPendaftar" BOOLEAN NOT NULL DEFAULT false,
    "isGenerateKuliah" BOOLEAN NOT NULL DEFAULT false,
    "isSevimaPay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JenisTagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KegiatanAkademik" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "isEvent" BOOLEAN NOT NULL DEFAULT false,
    "isSyaratPembayaran" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KegiatanAkademik_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JenisTagihan_kode_key" ON "public"."JenisTagihan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "KegiatanAkademik_kode_key" ON "public"."KegiatanAkademik"("kode");

-- AddForeignKey
ALTER TABLE "public"."JenisTagihan" ADD CONSTRAINT "JenisTagihan_kelompokId_fkey" FOREIGN KEY ("kelompokId") REFERENCES "public"."Kelompok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JenisTagihan" ADD CONSTRAINT "JenisTagihan_frekuensiId_fkey" FOREIGN KEY ("frekuensiId") REFERENCES "public"."Frekuensi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JenisTagihan" ADD CONSTRAINT "JenisTagihan_eventKegiatanAkademikId_fkey" FOREIGN KEY ("eventKegiatanAkademikId") REFERENCES "public"."KegiatanAkademik"("id") ON DELETE SET NULL ON UPDATE CASCADE;
