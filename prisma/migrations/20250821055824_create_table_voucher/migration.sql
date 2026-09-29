-- CreateTable
CREATE TABLE "public"."Voucer" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "periodeAwalId" INTEGER,
    "periodeAkhirId" INTEGER,
    "tanggalExpired" TIMESTAMP(3),
    "anggaran" INTEGER NOT NULL,
    "realisasi" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucer_kode_key" ON "public"."Voucer"("kode");

-- AddForeignKey
ALTER TABLE "public"."Voucer" ADD CONSTRAINT "Voucer_periodeAwalId_fkey" FOREIGN KEY ("periodeAwalId") REFERENCES "public"."Periode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucer" ADD CONSTRAINT "Voucer_periodeAkhirId_fkey" FOREIGN KEY ("periodeAkhirId") REFERENCES "public"."Periode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
