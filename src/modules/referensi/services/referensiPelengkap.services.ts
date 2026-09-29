import { prisma } from "../../../config/database.js";
import { InternalServerError, ConflictError, NotFoundError } from "../../../types/errors.js";
import { Rekanan } from "@prisma/client";
import { ForeignKeyHelper } from "../../../utils/ForeignKeyHelper.js";

export class KegiatanAkademikService {
  async getKegiatanAkademik() {
    try {
      return prisma.kegiatanAkademik.findMany();
    } catch (error) {
      console.error("Error fetching Kegiatan Akademik:", error);
      throw new InternalServerError("Gagal mengambil data Kegiatan Akademik");
    }
  }
}

export class RekananService {
  async getSearchFields() {
    try {
      const searchFields = [
        {
          name: "nama",
          label: "Nama",
        },
        {
          name: "kota",
          label: "Kota",
        },
        {
          name: "telepon",
          label: "Telepon",
        },
        {
          name: "email",
          label: "Alamat Email",
        },
      ];

      return {
        message: "Search fields rekanan berhasil diambil",
        data: searchFields,
      };
    } catch (error) {
      console.error("Error in getSearchFields:", error);
      throw new InternalServerError("Gagal mengambil search fields rekanan");
    }
  }

  async getRekanan(params: { page?: number; limit?: number; searchBy?: string; searchValue?: string }) {
    try {
      const { page = 1, limit = 10, searchBy = "all", searchValue = "" } = params;

      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = limit;

      // Build where clause
      const whereClause: any = {};

      // Add search conditions
      if (searchValue && searchValue.trim() !== "") {
        const searchConditions = [];

        if (searchBy === "all") {
          // Search across multiple fields
          searchConditions.push(
            { nama: { contains: searchValue, mode: "insensitive" } },
            { kota: { contains: searchValue, mode: "insensitive" } },
            { telepon: { contains: searchValue, mode: "insensitive" } },
            { email: { contains: searchValue, mode: "insensitive" } }
          );
        } else {
          // Search by specific field
          switch (searchBy) {
            case "nama":
              searchConditions.push({ nama: { contains: searchValue, mode: "insensitive" } });
              break;
            case "kota":
              searchConditions.push({ kota: { contains: searchValue, mode: "insensitive" } });
              break;
            case "telepon":
              searchConditions.push({ telepon: { contains: searchValue, mode: "insensitive" } });
              break;
            case "email":
              searchConditions.push({ email: { contains: searchValue, mode: "insensitive" } });
              break;
          }
        }

        if (searchConditions.length > 0) {
          whereClause.OR = searchConditions;
        }
      }

      // Get data with pagination
      const [data, total] = await Promise.all([
        prisma.rekanan.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.rekanan.count({
          where: whereClause,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        message: "Data rekanan berhasil diambil",
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalData: total,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      };
    } catch (error) {
      console.error("Error in getRekanan:", error);
      throw new InternalServerError("Gagal mengambil data rekanan");
    }
  }

  async addRekanan(data: Omit<Rekanan, "id" | "createdAt" | "updatedAt">) {
    try {
      // Check if nama rekanan already exists (case insensitive)
      const existingRekanan = await prisma.rekanan.findFirst({
        where: {
          nama: {
            equals: data.nama,
            mode: "insensitive",
          },
        },
      });

      if (existingRekanan) {
        throw new ConflictError("Nama rekanan sudah digunakan");
      }

      // Check if email already exists (if provided)
      if (data.email) {
        const existingEmail = await prisma.rekanan.findFirst({
          where: {
            email: {
              equals: data.email,
              mode: "insensitive",
            },
          },
        });

        if (existingEmail) {
          throw new ConflictError("Email sudah digunakan oleh rekanan lain");
        }
      }

      // Create new rekanan
      const newRekanan = await prisma.rekanan.create({
        data: {
          nama: data.nama,
          kota: data.kota || null,
          telepon: data.telepon || null,
          email: data.email || null,
        },
      });

      return {
        message: "Rekanan berhasil ditambahkan",
        data: newRekanan,
      };
    } catch (error) {
      console.error("Error in addRekanan:", error);

      if (error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal menambahkan rekanan");
    }
  }

  async deleteRekanan(id: Rekanan["id"]) {
    try {
      // Check if rekanan exists first
      const existingRekanan = await prisma.rekanan.findUnique({
        where: { id },
      });

      if (!existingRekanan) {
        throw new NotFoundError("Rekanan tidak ditemukan");
      }

      // Use ForeignKeyHelper to handle delete with automatic foreign key checking
      const result = await ForeignKeyHelper.handleDelete(async () => {
        await prisma.rekanan.delete({
          where: { id },
        });

        return {
          message: "Rekanan berhasil dihapus",
          deletedRecord: {
            id: existingRekanan.id,
            nama: existingRekanan.nama,
            kota: existingRekanan.kota,
            telepon: existingRekanan.telepon,
            email: existingRekanan.email,
            createdAt: existingRekanan.createdAt,
            updatedAt: existingRekanan.updatedAt,
          },
        };
      }, "Rekanan");

      return result;
    } catch (error) {
      console.error("Error in deleteRekanan:", error);

      // Handle known error types
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal menghapus rekanan");
    }
  }

  async updateRekanan(id: Rekanan["id"], data: Partial<Omit<Rekanan, "id" | "createdAt" | "updatedAt">>) {
    try {
      // Check if rekanan exists
      const existingRekanan = await prisma.rekanan.findUnique({
        where: { id },
      });

      if (!existingRekanan) {
        throw new NotFoundError("Rekanan tidak ditemukan");
      }

      // Build update data
      const updateData: any = {};

      // Check if nama is being updated and not duplicate
      if (data.nama !== undefined) {
        const existingNama = await prisma.rekanan.findFirst({
          where: {
            AND: [
              {
                nama: {
                  equals: data.nama,
                  mode: "insensitive",
                },
              },
              {
                id: { not: id },
              },
            ],
          },
        });

        if (existingNama) {
          throw new ConflictError("Nama rekanan sudah digunakan");
        }

        updateData.nama = data.nama;
      }

      // Check if email is being updated and not duplicate
      if (data.email !== undefined) {
        if (data.email) {
          const existingEmail = await prisma.rekanan.findFirst({
            where: {
              AND: [
                {
                  email: {
                    equals: data.email,
                    mode: "insensitive",
                  },
                },
                {
                  id: { not: id },
                },
              ],
            },
          });

          if (existingEmail) {
            throw new ConflictError("Email sudah digunakan oleh rekanan lain");
          }
        }

        updateData.email = data.email || null;
      }

      // Add other fields
      if (data.kota !== undefined) {
        updateData.kota = data.kota || null;
      }

      if (data.telepon !== undefined) {
        updateData.telepon = data.telepon || null;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        throw new ConflictError("Minimal satu field harus diisi untuk update");
      }

      // Update rekanan
      const updatedRekanan = await prisma.rekanan.update({
        where: { id },
        data: updateData,
      });

      return {
        message: "Rekanan berhasil diperbarui",
        data: updatedRekanan,
      };
    } catch (error) {
      console.error("Error in updateRekanan:", error);

      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal memperbarui rekanan");
    }
  }
}
