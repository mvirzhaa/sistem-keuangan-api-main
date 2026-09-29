-- CreateEnum
CREATE TYPE "public"."LevelUnitKerja" AS ENUM ('UNIVERSITAS', 'FAKULTAS', 'PROGRAM_STUDI');

-- CreateEnum
CREATE TYPE "public"."JenjangPendidikan" AS ENUM ('PROFESI', 'DIPLOMA_4', 'SARJANA', 'MAGISTER', 'DOKTOR');

-- CreateTable
CREATE TABLE "public"."unit_kerja" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT,
    "level" "public"."LevelUnitKerja" NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fakultas" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT,
    "unitKerjaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program_studi" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT,
    "fakultasId" INTEGER NOT NULL,
    "unitKerjaId" INTEGER NOT NULL,
    "jenjang" "public"."JenjangPendidikan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_studi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_kerja_kode_key" ON "public"."unit_kerja"("kode");

-- CreateIndex
CREATE INDEX "unit_kerja_parentId_idx" ON "public"."unit_kerja"("parentId");

-- CreateIndex
CREATE INDEX "unit_kerja_level_idx" ON "public"."unit_kerja"("level");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_kode_key" ON "public"."fakultas"("kode");

-- CreateIndex
CREATE INDEX "fakultas_unitKerjaId_idx" ON "public"."fakultas"("unitKerjaId");

-- CreateIndex
CREATE UNIQUE INDEX "program_studi_kode_key" ON "public"."program_studi"("kode");

-- CreateIndex
CREATE INDEX "program_studi_fakultasId_idx" ON "public"."program_studi"("fakultasId");

-- CreateIndex
CREATE INDEX "program_studi_unitKerjaId_idx" ON "public"."program_studi"("unitKerjaId");

-- AddForeignKey
ALTER TABLE "public"."unit_kerja" ADD CONSTRAINT "unit_kerja_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."unit_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fakultas" ADD CONSTRAINT "fakultas_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "public"."unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."program_studi" ADD CONSTRAINT "program_studi_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "public"."fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."program_studi" ADD CONSTRAINT "program_studi_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "public"."unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
