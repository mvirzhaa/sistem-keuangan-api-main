-- CreateTable
CREATE TABLE "public"."AturanPotongan" (
    "id" TEXT NOT NULL,
    "nomorUrut" INTEGER NOT NULL,
    "potonganId" TEXT NOT NULL,
    "jenisTagihanId" TEXT NOT NULL,
    "maksimalNominal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AturanPotongan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AturanPotongan" ADD CONSTRAINT "AturanPotongan_potonganId_fkey" FOREIGN KEY ("potonganId") REFERENCES "public"."Potongan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AturanPotongan" ADD CONSTRAINT "AturanPotongan_jenisTagihanId_fkey" FOREIGN KEY ("jenisTagihanId") REFERENCES "public"."JenisTagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
