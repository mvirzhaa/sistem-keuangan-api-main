import { prisma } from "../../../config/database.js";
import { JenisTagihan, Kelompok } from "@prisma/client";
import { NotFoundError, ConflictError, BadRequestError, InternalServerError } from "../../../types/errors.js";

export class JenisTransaksiService {
  async getAll() {
    try {
      const data = await prisma.jenisTransaksi.findMany({});
      return data;
    } catch (error) {
      console.error("Error in getAll JenisTransaksi:", error);
      throw new InternalServerError("Gagal mengambil data jenis transaksi");
    }
  }
}

export class KelompokService {
  async getAll(jenisTransaksiId?: number) {
    try {
      return await prisma.kelompok.findMany({
        where: jenisTransaksiId ? { jenisTransaksiId } : {},
        include: {
          jenisUser: true,
        },
        orderBy: { kode: "asc" },
      });
    } catch (error) {
      console.error("Error in getAll Kelompok:", error);
      throw new InternalServerError("Gagal mengambil data kelompok");
    }
  }

  async addKelompok(data: Kelompok) {
    try {
      return await prisma.kelompok.create({
        data,
        include: {
          jenisUser: {
            select: { nama: true },
          },
          jenisTransaksi: {
            select: { kode: true, nama: true },
          },
        },
      });
    } catch (error) {
      console.error("Error in addKelompok:", error);
      throw new InternalServerError("Gagal menambahkan kelompok");
    }
  }

  async updateKelompok(id: number, data: Partial<Kelompok>) {
    try {
      // Check if kelompok exists
      const existing = await prisma.kelompok.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundError("Kelompok tidak ditemukan");
      }

      return await prisma.kelompok.update({
        where: { id },
        data,
        include: {
          jenisUser: {
            select: { nama: true },
          },
          jenisTransaksi: {
            select: { kode: true, nama: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in updateKelompok:", error);
      throw new InternalServerError("Gagal memperbarui kelompok");
    }
  }

  async deleteKelompok(id: number) {
    try {
      // Check if kelompok exists
      const existing = await prisma.kelompok.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundError("Kelompok tidak ditemukan");
      }

      return await prisma.kelompok.delete({
        where: { id },
        include: {
          jenisUser: {
            select: { nama: true },
          },
          jenisTransaksi: {
            select: { kode: true, nama: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in deleteKelompok:", error);
      throw new InternalServerError("Gagal menghapus kelompok");
    }
  }
}

export class FrekuensiService {
  async getAll() {
    try {
      return await prisma.frekuensi.findMany({
        orderBy: { kode: "asc" },
      });
    } catch (error) {
      console.error("Error in getAll Frekuensi:", error);
      throw new InternalServerError("Gagal mengambil data frekuensi");
    }
  }
}

export class JenisTagihanService {
  async getAll(params: { page?: number; limit?: number; searchBy?: string; searchValue?: string; filterKelompok?: number | undefined; filterFrekuensi?: number | undefined }) {
    try {
      const { page = 1, limit = 10, searchBy = "all", searchValue = "", filterKelompok, filterFrekuensi } = params;

      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = limit;

      // Build where clause
      const whereClause: any = {};

      // Add filter conditions
      if (filterKelompok) {
        whereClause.kelompokId = filterKelompok;
      }

      if (filterFrekuensi) {
        whereClause.frekuensiId = filterFrekuensi;
      }

      // Add search conditions
      if (searchValue && searchValue.trim() !== "") {
        const searchConditions = [];

        if (searchBy === "all") {
          // Search across multiple fields
          searchConditions.push(
            { kode: { contains: searchValue, mode: "insensitive" } },
            { namaJenisTagihan: { contains: searchValue, mode: "insensitive" } },
            { kelompok: { nama: { contains: searchValue, mode: "insensitive" } } },
            { frekuensi: { nama: { contains: searchValue, mode: "insensitive" } } },
            { kegiatanAkademik: { nama: { contains: searchValue, mode: "insensitive" } } }
          );
        } else {
          // Search by specific field
          switch (searchBy) {
            case "kode":
              searchConditions.push({ kode: { contains: searchValue, mode: "insensitive" } });
              break;
            case "namaJenisTagihan":
              searchConditions.push({ namaJenisTagihan: { contains: searchValue, mode: "insensitive" } });
              break;
            case "kelompok":
              searchConditions.push({ kelompok: { nama: { contains: searchValue, mode: "insensitive" } } });
              break;
            case "jenisBiayaNeofeeder":
              searchConditions.push({ jenisBiayaNeofeeder: { equals: searchValue as any } });
              break;
            case "frekuensi":
              searchConditions.push({ frekuensi: { nama: { contains: searchValue, mode: "insensitive" } } });
              break;
            case "event":
              searchConditions.push({ kegiatanAkademik: { nama: { contains: searchValue, mode: "insensitive" } } });
              break;
            case "mahasiswa":
              const isMahasiswaValue = searchValue.toLowerCase() === "true" || searchValue === "1";
              searchConditions.push({ isMahasiswa: isMahasiswaValue });
              break;
            case "pendaftar":
              const isPendaftarValue = searchValue.toLowerCase() === "true" || searchValue === "1";
              searchConditions.push({ isPendaftar: isPendaftarValue });
              break;
            case "generateKuliah":
              const isGenerateKuliahValue = searchValue.toLowerCase() === "true" || searchValue === "1";
              searchConditions.push({ isGenerateKuliah: isGenerateKuliahValue });
              break;
            case "sevimaPay":
              const isSevimePayValue = searchValue.toLowerCase() === "true" || searchValue === "1";
              searchConditions.push({ isSevimaPay: isSevimePayValue });
              break;
          }
        }

        if (searchConditions.length > 0) {
          whereClause.OR = searchConditions;
        }
      }

      // Get data with pagination
      const [data, total] = await Promise.all([
        prisma.jenisTagihan.findMany({
          where: whereClause,
          include: {
            kelompok: {
              select: {
                id: true,
                kode: true,
                nama: true,
              },
            },
            frekuensi: {
              select: {
                id: true,
                kode: true,
                nama: true,
                jumlahHari: true,
              },
            },
            kegiatanAkademik: {
              select: {
                id: true,
                kode: true,
                nama: true,
                isEvent: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.jenisTagihan.count({
          where: whereClause,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        message: "Data jenis tagihan berhasil diambil",
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
      console.error("Error in getAll JenisTagihan:", error);
      throw new InternalServerError("Gagal mengambil data jenis tagihan");
    }
  }

  async getSearchFields() {
    try {
      const searchFields = [
        {
          name: "kode",
          label: "Kode",
        },
        {
          name: "namaJenisTagihan",
          label: "Nama Jenis Tagihan",
        },
        {
          name: "kelompok",
          label: "Kelompok",
        },
        {
          name: "jenisBiayaNeofeeder",
          label: "Jenis Biaya Neofeeder",
        },
        {
          name: "frekuensi",
          label: "Frekuensi",
        },
        {
          name: "event",
          label: "Event",
        },
        {
          name: "mahasiswa",
          label: "Mahasiswa",
        },
        {
          name: "pendaftar",
          label: "Pendaftar",
        },
        {
          name: "generateKuliah",
          label: "GenerateKuliah?",
        },
        {
          name: "sevimaPay",
          label: "SevimaPay?",
        },
      ];

      return {
        message: "Search fields berhasil diambil",
        data: searchFields,
      };
    } catch (error) {
      console.error("Error in getSearchFields:", error);
      throw new InternalServerError("Gagal mengambil search fields");
    }
  }

  async addData(data: {
    kode: string;
    namaJenisTagihan: string;
    kelompokId: number;
    jenisBiayaNeofeeder?: "BIAYA_MASUK" | "BIAYA_SEMESTER" | "TIDAK_DILAPORKAN" | null;
    frekuensiId: number;
    eventKegiatanAkademikId?: number | null;
    isMahasiswa?: boolean;
    isPendaftar?: boolean;
    isGenerateKuliah?: boolean;
    isSevimaPay?: boolean;
  }) {
    try {
      // Check if kode already exists
      const existingKode = await prisma.jenisTagihan.findUnique({
        where: { kode: data.kode },
      });

      if (existingKode) {
        throw new ConflictError(`Kode jenis tagihan '${data.kode}' sudah digunakan`);
      }

      const result = await prisma.jenisTagihan.create({
        data: {
          kode: data.kode,
          namaJenisTagihan: data.namaJenisTagihan,
          kelompokId: data.kelompokId,
          jenisBiayaNeofeeder: data.jenisBiayaNeofeeder || null,
          frekuensiId: data.frekuensiId,
          eventKegiatanAkademikId: data.eventKegiatanAkademikId || null,
          isMahasiswa: data.isMahasiswa || false,
          isPendaftar: data.isPendaftar || false,
          isGenerateKuliah: data.isGenerateKuliah || false,
          isSevimaPay: data.isSevimaPay || false,
        },
        include: {
          kelompok: {
            select: {
              id: true,
              kode: true,
              nama: true,
              jenisUser: {
                select: { nama: true },
              },
            },
          },
          frekuensi: {
            select: {
              id: true,
              kode: true,
              nama: true,
              jumlahHari: true,
            },
          },
          kegiatanAkademik: {
            select: {
              id: true,
              kode: true,
              nama: true,
              isEvent: true,
            },
          },
        },
      });

      return {
        message: "Jenis tagihan berhasil ditambahkan",
        data: result,
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error("Error in addData JenisTagihan:", error);
      throw new InternalServerError("Gagal menambahkan jenis tagihan");
    }
  }

  async updateData(
    id: string,
    data: {
      kode?: string;
      namaJenisTagihan?: string;
      kelompokId?: number;
      jenisBiayaNeofeeder?: "BIAYA_MASUK" | "BIAYA_SEMESTER" | "TIDAK_DILAPORKAN" | null;
      frekuensiId?: number;
      eventKegiatanAkademikId?: number | null;
      isMahasiswa?: boolean;
      isPendaftar?: boolean;
      isGenerateKuliah?: boolean;
      isSevimaPay?: boolean;
    }
  ) {
    try {
      // Check if jenis tagihan exists
      const existing = await prisma.jenisTagihan.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundError("Jenis tagihan tidak ditemukan");
      }

      // Check kode uniqueness if kode is being updated
      if (data.kode && data.kode !== existing.kode) {
        const existingKode = await prisma.jenisTagihan.findUnique({
          where: { kode: data.kode },
        });
        if (existingKode) {
          throw new ConflictError(`Kode jenis tagihan '${data.kode}' sudah digunakan`);
        }
      }

      // Build update data object - only include provided fields
      const updateData: any = {};

      if (data.kode !== undefined) updateData.kode = data.kode;
      if (data.namaJenisTagihan !== undefined) updateData.namaJenisTagihan = data.namaJenisTagihan;
      if (data.kelompokId !== undefined) updateData.kelompokId = data.kelompokId;
      if (data.jenisBiayaNeofeeder !== undefined) updateData.jenisBiayaNeofeeder = data.jenisBiayaNeofeeder;
      if (data.frekuensiId !== undefined) updateData.frekuensiId = data.frekuensiId;
      if (data.eventKegiatanAkademikId !== undefined) updateData.eventKegiatanAkademikId = data.eventKegiatanAkademikId;
      if (data.isMahasiswa !== undefined) updateData.isMahasiswa = data.isMahasiswa;
      if (data.isPendaftar !== undefined) updateData.isPendaftar = data.isPendaftar;
      if (data.isGenerateKuliah !== undefined) updateData.isGenerateKuliah = data.isGenerateKuliah;
      if (data.isSevimaPay !== undefined) updateData.isSevimaPay = data.isSevimaPay;

      const result = await prisma.jenisTagihan.update({
        where: { id },
        data: updateData,
        include: {
          kelompok: {
            select: {
              id: true,
              kode: true,
              nama: true,
              jenisUser: {
                select: { nama: true },
              },
            },
          },
          frekuensi: {
            select: {
              id: true,
              kode: true,
              nama: true,
              jumlahHari: true,
            },
          },
          kegiatanAkademik: {
            select: {
              id: true,
              kode: true,
              nama: true,
              isEvent: true,
            },
          },
        },
      });

      return {
        message: "Jenis tagihan berhasil diperbarui",
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error("Error in updateData JenisTagihan:", error);
      throw new InternalServerError("Gagal memperbarui jenis tagihan");
    }
  }

  async deleteDataBulk(ids: string | string[]) {
    try {
      // Convert single ID to array for uniform processing
      const idArray = Array.isArray(ids) ? ids : [ids];

      if (idArray.length === 0) {
        throw new BadRequestError("Tidak ada ID yang diberikan untuk dihapus");
      }

      // Validate all IDs exist
      const existingRecords = await prisma.jenisTagihan.findMany({
        where: {
          id: {
            in: idArray,
          },
        },
        select: {
          id: true,
          kode: true,
          namaJenisTagihan: true,
        },
      });

      // Check if all IDs exist
      const foundIds = existingRecords.map((record) => record.id);
      const notFoundIds = idArray.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundError(`Jenis tagihan dengan ID ${notFoundIds.join(", ")} tidak ditemukan`);
      }

      // Delete the records
      const result = await prisma.jenisTagihan.deleteMany({
        where: {
          id: {
            in: idArray,
          },
        },
      });

      return {
        message: `${result.count} jenis tagihan berhasil dihapus`,
        deletedCount: result.count,
        deletedIds: idArray,
        deletedRecords: existingRecords,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      console.error("Error in deleteDataBulk JenisTagihan:", error);
      throw new InternalServerError("Gagal menghapus jenis tagihan");
    }
  }

  async deleteDataSingle(id: string) {
    try {
      // Check if record exists
      const existing = await prisma.jenisTagihan.findUnique({
        where: { id },
        select: {
          id: true,
          kode: true,
          namaJenisTagihan: true,
        },
      });

      if (!existing) {
        throw new NotFoundError("Jenis tagihan tidak ditemukan");
      }

      // Delete the record
      await prisma.jenisTagihan.delete({
        where: { id },
      });

      return {
        message: "Jenis tagihan berhasil dihapus",
        deletedRecord: existing,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in deleteDataSingle JenisTagihan:", error);
      throw new InternalServerError("Gagal menghapus jenis tagihan");
    }
  }

  async updateJenisBiayaBulk(data: { ids: string[]; jenisBiayaNeofeeder?: "BIAYA_MASUK" | "BIAYA_SEMESTER" | "TIDAK_DILAPORKAN" | null }) {
    try {
      const { ids, jenisBiayaNeofeeder } = data;

      // Validate IDs
      if (!ids || ids.length === 0) {
        throw new NotFoundError("Tidak ada ID yang diberikan untuk pembaruan");
      }

      // Update records
      const result = await prisma.jenisTagihan.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          jenisBiayaNeofeeder: jenisBiayaNeofeeder || null,
        },
      });

      return {
        message: `${result.count} jenis tagihan berhasil diperbarui`,
        updatedCount: result.count,
        updatedIds: ids,
      };
    } catch (error) {
      console.error("Error in updateDataBulk JenisTagihan:", error);
      throw new InternalServerError("Gagal memperbarui jenis tagihan");
    }
  }
}
