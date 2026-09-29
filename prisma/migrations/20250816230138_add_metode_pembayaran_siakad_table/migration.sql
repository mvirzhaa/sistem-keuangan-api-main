-- CreateEnum
CREATE TYPE "public"."JenisMetodePembayaran" AS ENUM ('OFFLINE', 'ONLINE', 'H2H', 'DEPOSIT');

-- AlterTable
ALTER TABLE "public"."ChannelPembayaranSiakad" ADD COLUMN     "metodePembayaranSiakadId" INTEGER;

-- CreateTable
CREATE TABLE "public"."MetodePembayaranSiakad" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "namaMetodePembayaran" TEXT NOT NULL,
    "jenis" "public"."JenisMetodePembayaran" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isAbleToAddChannel" BOOLEAN NOT NULL DEFAULT false,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    "isDeleteable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetodePembayaranSiakad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetodePembayaranSiakad_kode_key" ON "public"."MetodePembayaranSiakad"("kode");

-- AddForeignKey
ALTER TABLE "public"."ChannelPembayaranSiakad" ADD CONSTRAINT "ChannelPembayaranSiakad_metodePembayaranSiakadId_fkey" FOREIGN KEY ("metodePembayaranSiakadId") REFERENCES "public"."MetodePembayaranSiakad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
