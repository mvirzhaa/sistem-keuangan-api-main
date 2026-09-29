-- CreateEnum
CREATE TYPE "public"."Gelombang" AS ENUM ('GELOMBANG_1', 'GELOMBANG_2', 'GELOMBANG_3', 'KIP_A', 'KIP_B', 'KIP_C');

-- CreateEnum
CREATE TYPE "public"."SistemKuliah" AS ENUM ('REGULER', 'REGULER_SORE', 'KARYAWAN');

-- CreateTable
CREATE TABLE "public"."JalurPendaftaran" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JalurPendaftaran_pkey" PRIMARY KEY ("id")
);
