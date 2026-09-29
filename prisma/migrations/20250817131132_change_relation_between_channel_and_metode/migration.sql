/*
  Warnings:

  - You are about to drop the column `metodePembayaranSiakadId` on the `ChannelPembayaranSiakad` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ChannelPembayaranSiakad" DROP CONSTRAINT "ChannelPembayaranSiakad_metodePembayaranSiakadId_fkey";

-- AlterTable
ALTER TABLE "public"."ChannelPembayaranSiakad" DROP COLUMN "metodePembayaranSiakadId";

-- CreateTable
CREATE TABLE "public"."MetodePembayaranChannel" (
    "id" SERIAL NOT NULL,
    "metodePembayaranSiakadId" INTEGER NOT NULL,
    "channelPembayaranSiakadId" INTEGER NOT NULL,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetodePembayaranChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetodePembayaranChannel_metodePembayaranSiakadId_channelPem_key" ON "public"."MetodePembayaranChannel"("metodePembayaranSiakadId", "channelPembayaranSiakadId");

-- AddForeignKey
ALTER TABLE "public"."MetodePembayaranChannel" ADD CONSTRAINT "MetodePembayaranChannel_metodePembayaranSiakadId_fkey" FOREIGN KEY ("metodePembayaranSiakadId") REFERENCES "public"."MetodePembayaranSiakad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MetodePembayaranChannel" ADD CONSTRAINT "MetodePembayaranChannel_channelPembayaranSiakadId_fkey" FOREIGN KEY ("channelPembayaranSiakadId") REFERENCES "public"."ChannelPembayaranSiakad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
