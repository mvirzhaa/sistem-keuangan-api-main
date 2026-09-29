-- CreateTable
CREATE TABLE "public"."ChannelPembayaranSiakad" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "namaChannelPembayaran" TEXT NOT NULL,
    "logo" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelPembayaranSiakad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPembayaranSiakad_kode_key" ON "public"."ChannelPembayaranSiakad"("kode");
