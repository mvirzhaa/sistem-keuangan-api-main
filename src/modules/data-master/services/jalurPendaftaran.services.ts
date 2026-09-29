import { prisma } from "../../../config/database.js";
import { NotFoundError, InternalServerError, ConflictError } from "../../../types/errors.js";
import { ForeignKeyHelper } from "../../../utils/ForeignKeyHelper.js";

export class JalurPendaftaranService {
  // Get all jalur pendaftaran
  async getAllJalurPendaftaran() {
    try {
      const jalurPendaftaran = await prisma.jalurPendaftaran.findMany({
        orderBy: { nama: "asc" },
      });

      return {
        message: "Data jalur pendaftaran berhasil diambil",
        data: jalurPendaftaran,
      };
    } catch (error) {
      console.error("Error in getAllJalurPendaftaran:", error);
      throw new InternalServerError("Gagal mengambil data jalur pendaftaran");
    }
  }

  // Get jalur pendaftaran by ID
  async getJalurPendaftaranById(id: number) {
    try {
      const jalurPendaftaran = await prisma.jalurPendaftaran.findUnique({
        where: { id },
      });

      if (!jalurPendaftaran) {
        throw new NotFoundError("Jalur pendaftaran tidak ditemukan");
      }

      return {
        message: "Data jalur pendaftaran berhasil diambil",
        data: jalurPendaftaran,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in getJalurPendaftaranById:", error);
      throw new InternalServerError("Gagal mengambil data jalur pendaftaran");
    }
  }

  // Create jalur pendaftaran
  async createJalurPendaftaran(data: { nama: string }) {
    try {
      // Check if nama already exists
      const existingNama = await prisma.jalurPendaftaran.findFirst({
        where: {
          nama: {
            equals: data.nama,
            mode: "insensitive",
          },
        },
      });

      if (existingNama) {
        throw new ConflictError("Nama jalur pendaftaran sudah ada");
      }

      const jalurPendaftaran = await prisma.jalurPendaftaran.create({
        data,
      });

      return {
        message: "Jalur pendaftaran berhasil dibuat",
        data: jalurPendaftaran,
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error("Error in createJalurPendaftaran:", error);
      throw new InternalServerError("Gagal membuat jalur pendaftaran");
    }
  }

  // Update jalur pendaftaran
  async updateJalurPendaftaran(
    id: number,
    data: {
      nama?: string;
    }
  ) {
    try {
      // Check if jalur pendaftaran exists
      const existing = await prisma.jalurPendaftaran.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundError("Jalur pendaftaran tidak ditemukan");
      }

      // Check if nama already exists (excluding current record)
      if (data.nama && data.nama !== existing.nama) {
        const existingNama = await prisma.jalurPendaftaran.findFirst({
          where: {
            nama: {
              equals: data.nama,
              mode: "insensitive",
            },
            id: { not: id },
          },
        });

        if (existingNama) {
          throw new ConflictError("Nama jalur pendaftaran sudah ada");
        }
      }

      const jalurPendaftaran = await prisma.jalurPendaftaran.update({
        where: { id },
        data,
      });

      return {
        message: "Jalur pendaftaran berhasil diperbarui",
        data: jalurPendaftaran,
      };
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in updateJalurPendaftaran:", error);
      throw new InternalServerError("Gagal memperbarui jalur pendaftaran");
    }
  }

  // Delete jalur pendaftaran
  async deleteJalurPendaftaran(id: number) {
    try {
      const existing = await prisma.jalurPendaftaran.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundError("Jalur pendaftaran tidak ditemukan");
      }

      // Use ForeignKeyHelper to handle delete with automatic foreign key checking
      const result = await ForeignKeyHelper.handleDelete(async () => {
        await prisma.jalurPendaftaran.delete({
          where: { id },
        });

        return {
          message: "Jalur pendaftaran berhasil dihapus",
          deletedRecord: {
            id: existing.id,
            nama: existing.nama,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt,
          },
        };
      }, "Jalur Pendaftaran");

      return result;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in deleteJalurPendaftaran:", error);
      throw new InternalServerError("Gagal menghapus jalur pendaftaran");
    }
  }

  // Delete multiple jalur pendaftaran (bulk delete)
  async deleteJalurPendaftaranBulk(ids: number[]) {
    try {
      if (!ids || ids.length === 0) {
        throw new ConflictError("Tidak ada ID yang diberikan untuk dihapus");
      }

      // Validate all IDs exist
      const existingJalurPendaftaran = await prisma.jalurPendaftaran.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      // Check if all IDs exist
      const foundIds = existingJalurPendaftaran.map((jalur) => jalur.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundError(`Jalur pendaftaran dengan ID ${notFoundIds.join(", ")} tidak ditemukan`);
      }

      // Use ForeignKeyHelper to handle bulk delete with foreign key checking
      const result = await ForeignKeyHelper.handleDelete(async () => {
        const deleteResult = await prisma.jalurPendaftaran.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

        return {
          message: `${deleteResult.count} jalur pendaftaran berhasil dihapus`,
          deletedCount: deleteResult.count,
          deletedIds: ids,
          deletedRecords: existingJalurPendaftaran.map((jalur) => ({
            id: jalur.id,
            nama: jalur.nama,
            createdAt: jalur.createdAt,
            updatedAt: jalur.updatedAt,
          })),
        };
      }, "Jalur Pendaftaran");

      return result;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error("Error in deleteJalurPendaftaranBulk:", error);
      throw new InternalServerError("Gagal menghapus jalur pendaftaran secara bulk");
    }
  }

  // Validate if jalur pendaftaran can be deleted
  async validateCanDeleteJalurPendaftaran(id: number) {
    try {
      await ForeignKeyHelper.validateCanDelete(async () => {
        const jalurPendaftaran = await prisma.jalurPendaftaran.findUnique({
          where: { id },
        });

        if (!jalurPendaftaran) {
          return { hasReferences: false };
        }

        // Add checks for any future relations that might reference JalurPendaftaran
        // For now, there are no foreign key references to this table in the schema

        return { hasReferences: false };
      }, "Jalur Pendaftaran");

      return {
        canDelete: true,
        message: "Jalur pendaftaran dapat dihapus",
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        return {
          canDelete: false,
          message: error.message,
        };
      }
      throw error;
    }
  }
}
