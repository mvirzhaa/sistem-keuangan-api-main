-- CreateTable
CREATE TABLE "public"."RekananTestTableUhuy" (
    "id" SERIAL NOT NULL,
    "rekananId" INTEGER NOT NULL,

    CONSTRAINT "RekananTestTableUhuy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RekananTestTableUhuy" ADD CONSTRAINT "RekananTestTableUhuy_rekananId_fkey" FOREIGN KEY ("rekananId") REFERENCES "public"."Rekanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
