-- CreateTable
CREATE TABLE "public"."TarifTagihan" (
    "id" TEXT NOT NULL,
    "periodeId" INTEGER NOT NULL,
    "gelombang" "public"."Gelombang" NOT NULL,
    "sistemKuliah" "public"."SistemKuliah" NOT NULL,
    "jalurPendaftaranId" INTEGER NOT NULL,
    "programStudiId" INTEGER NOT NULL,
    "jenisTagihanId" TEXT NOT NULL,
    "jumlahCicilan" INTEGER NOT NULL DEFAULT 1,
    "SKSSemester" INTEGER,
    "nominal" INTEGER NOT NULL,
    "frekuensiDenda" INTEGER,
    "nominalDenda" INTEGER,
    "maksimalDenda" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TarifTagihan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TarifTagihan" ADD CONSTRAINT "TarifTagihan_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "public"."Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TarifTagihan" ADD CONSTRAINT "TarifTagihan_jalurPendaftaranId_fkey" FOREIGN KEY ("jalurPendaftaranId") REFERENCES "public"."JalurPendaftaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TarifTagihan" ADD CONSTRAINT "TarifTagihan_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "public"."program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TarifTagihan" ADD CONSTRAINT "TarifTagihan_jenisTagihanId_fkey" FOREIGN KEY ("jenisTagihanId") REFERENCES "public"."JenisTagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
