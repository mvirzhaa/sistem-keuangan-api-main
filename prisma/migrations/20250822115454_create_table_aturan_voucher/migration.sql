-- CreateTable
CREATE TABLE "public"."AturanVoucher" (
    "id" TEXT NOT NULL,
    "voucerId" TEXT NOT NULL,
    "jenisTagihanId" TEXT NOT NULL,
    "maksimalNominal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AturanVoucher_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AturanVoucher" ADD CONSTRAINT "AturanVoucher_voucerId_fkey" FOREIGN KEY ("voucerId") REFERENCES "public"."Voucer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AturanVoucher" ADD CONSTRAINT "AturanVoucher_jenisTagihanId_fkey" FOREIGN KEY ("jenisTagihanId") REFERENCES "public"."JenisTagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
