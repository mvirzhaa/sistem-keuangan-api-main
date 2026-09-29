import { prisma } from "../../../config/database.js";
import { KelompokUKT } from "@prisma/client";
import { ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";

export class KelompokUKTService {
  async getAllKelompokUKT() {
    try {
      const data = await prisma.kelompokUKT.findMany({
        orderBy: {
          kode: "asc",
        },
      });
      return data;
    } catch (error) {
      console.error("Error in get All Kelompok UKT: ", error);
      throw new InternalServerError("Gagal mengambil data kelompok UKT");
    }
  }

  async addKelompokUKT(data: Omit<KelompokUKT, "id" | "createdAt" | "updatedAt">) {
    try {
      // Check if kode already exists
      const existingKode = await prisma.kelompokUKT.findUnique({
        where: { kode: data.kode },
      });

      if (existingKode) {
        throw new ConflictError("Kode kelompok UKT sudah digunakan");
      }

      // Create new kelompok UKT
      const newKelompokUKT = await prisma.kelompokUKT.create({
        data: {
          kode: data.kode,
          nama: data.nama,
          isKipKuliah: data.isKipKuliah,
        },
      });

      return {
        message: "Kelompok UKT berhasil ditambahkan",
        data: newKelompokUKT,
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error("Error in addKelompokUKT:", error);
      throw new InternalServerError("Gagal menambahkan kelompok UKT");
    }
  }

  async updateKelompokUKT(id: number, data: Partial<Omit<KelompokUKT, "id" | "createdAt" | "updatedAt">>) {
    // Check if record exists
    const existingKelompok = await prisma.kelompokUKT.findUnique({
      where: { id },
    });

    if (!existingKelompok) {
      throw new NotFoundError("Kelompok UKT tidak ditemukan");
    }

    // Validate kode uniqueness if kode is being updated
    if (data.kode && data.kode !== existingKelompok.kode) {
      const existingKode = await prisma.kelompokUKT.findFirst({
        where: {
          kode: data.kode,
          id: { not: id },
        },
      });

      if (existingKode) {
        throw new ConflictError("Kode kelompok UKT sudah digunakan");
      }
    }

    try {
      // Update the record
      const updatedKelompok = await prisma.kelompokUKT.update({
        where: { id },
        data: {
          ...(data.kode && { kode: data.kode }),
          ...(data.nama && { nama: data.nama }),
          ...(data.isKipKuliah !== undefined && { isKipKuliah: data.isKipKuliah }),
        },
      });

      return {
        message: "Kelompok UKT berhasil diperbarui",
        data: updatedKelompok,
      };
    } catch (error) {
      console.error("Error in updateKelompokUKT:", error);
      throw new InternalServerError("Gagal memperbarui kelompok UKT");
    }
  }

  async deleteKelompokUKT(id: number) {
    // Check if record exists
    const existingKelompok = await prisma.kelompokUKT.findUnique({
      where: { id },
    });

    if (!existingKelompok) {
      throw new NotFoundError("Kelompok UKT tidak ditemukan");
    }

    try {
      const deletedRecord = await prisma.kelompokUKT.delete({
        where: { id },
        select: {
          id: true,
          kode: true,
          nama: true,
          isKipKuliah: true,
        },
      });

      return {
        message: "Kelompok UKT berhasil dihapus",
        deletedRecord,
      };
    } catch (error) {
      console.error("Error in deleteKelompokUKT:", error);
      throw new InternalServerError("Gagal menghapus kelompok UKT");
    }
  }
}
