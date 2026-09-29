import { prisma } from "../../../config/database.js";
import { InternalServerError, ConflictError, NotFoundError, BadRequestError } from "../../../types/errors.js";
import { Voucer } from "@prisma/client";
import { ForeignKeyHelper } from "../../../utils/ForeignKeyHelper.js";

export class VoucherService {
  async getSearchFields() {
    try {
      const searchFields = [
        {
          name: "voucher",
          label: "Voucher",
        },
        {
          name: "kode",
          label: "Kode Voucher",
        },
        {
          name: "periodeAwal",
          label: "Periode Awal",
        },
        {
          name: "periodeAkhir",
          label: "Periode Akhir",
        },
        {
          name: "tanggalExpired",
          label: "Tgl. Expired",
        },
        {
          name: "nominal",
          label: "Nominal",
        },
      ];

      return {
        message: "Search fields voucher berhasil diambil",
        data: searchFields,
      };
    } catch (error) {
      console.error("Error in getSearchFields:", error);
      throw new InternalServerError("Gagal mengambil search fields voucher");
    }
  }

  async getAllVouchers(params: { page?: number; limit?: number; searchBy?: string; searchValue?: string }) {
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
            { kode: { contains: searchValue, mode: "insensitive" } },
            { periodeAwal: { namaPeriode: { contains: searchValue, mode: "insensitive" } } },
            { periodeAkhir: { namaPeriode: { contains: searchValue, mode: "insensitive" } } }
          );

          // Handle numeric search for nominal, anggaran, realisasi
          const numericValue = parseFloat(searchValue);
          if (!isNaN(numericValue)) {
            searchConditions.push({ nominal: { equals: numericValue } }, { anggaran: { equals: numericValue } }, { realisasi: { equals: numericValue } });
          }

          // Handle date search for tanggalExpired
          const dateValue = new Date(searchValue);
          if (!isNaN(dateValue.getTime())) {
            searchConditions.push({
              tanggalExpired: {
                gte: new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()),
                lt: new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate() + 1),
              },
            });
          }
        } else {
          // Search by specific field
          switch (searchBy) {
            case "voucher":
              searchConditions.push({ nama: { contains: searchValue, mode: "insensitive" } });
              break;
            case "kode":
              searchConditions.push({ kode: { contains: searchValue, mode: "insensitive" } });
              break;
            case "periodeAwal":
              searchConditions.push({
                periodeAwal: {
                  namaPeriode: { contains: searchValue, mode: "insensitive" },
                },
              });
              break;
            case "periodeAkhir":
              searchConditions.push({
                periodeAkhir: {
                  namaPeriode: { contains: searchValue, mode: "insensitive" },
                },
              });
              break;
            case "tanggalExpired":
              const dateValue = new Date(searchValue);
              if (!isNaN(dateValue.getTime())) {
                searchConditions.push({
                  tanggalExpired: {
                    gte: new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()),
                    lt: new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate() + 1),
                  },
                });
              }
              break;
            case "nominal":
              const nominalValue = parseFloat(searchValue);
              if (!isNaN(nominalValue)) {
                searchConditions.push({ nominal: { equals: nominalValue } });
              }
              break;
          }
        }

        if (searchConditions.length > 0) {
          whereClause.OR = searchConditions;
        }
      }

      // Get data with pagination
      const [data, total] = await Promise.all([
        prisma.voucer.findMany({
          where: whereClause,
          include: {
            periodeAwal: {
              select: {
                id: true,
                kode: true,
                namaPeriode: true,
                isAktif: true,
              },
            },
            periodeAkhir: {
              select: {
                id: true,
                kode: true,
                namaPeriode: true,
                isAktif: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.voucer.count({
          where: whereClause,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        message: "Data voucher berhasil diambil",
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
      console.error("Error in getAllVouchers:", error);
      throw new InternalServerError("Gagal mengambil data voucher");
    }
  }

  async addVoucher(data: {
    nama: string;
    kode?: string | undefined;
    generateKodeOtomatis?: boolean | undefined;
    nominal: number;
    periodeAwalId?: number | undefined;
    periodeAkhirId?: number | undefined;
    tanggalExpired?: Date | undefined;
    anggaran: number;
    realisasi?: number | undefined;
  }) {
    try {
      let finalKode = data.kode;

      // Handle automatic code generation
      if (data.generateKodeOtomatis) {
        finalKode = this.generateVoucherCode(data.nama);

        // Ensure the generated code is unique
        let counter = 1;
        let baseCode = finalKode;
        while (await this.isKodeExists(finalKode)) {
          finalKode = `${baseCode}${counter.toString().padStart(2, "0")}`;
          counter++;

          // Prevent infinite loop
          if (counter > 99) {
            throw new ConflictError("Tidak dapat membuat kode unik setelah 99 percobaan");
          }
        }
      } else {
        // Manual code validation
        if (!finalKode) {
          throw new ConflictError("Kode voucher wajib diisi jika generate otomatis tidak diaktifkan");
        }

        // Check if manual code already exists
        if (await this.isKodeExists(finalKode)) {
          throw new ConflictError("Kode voucher sudah digunakan");
        }
      }

      // Validate periode relationships if provided
      if (data.periodeAwalId) {
        const periodeAwal = await prisma.periode.findUnique({
          where: { id: data.periodeAwalId },
        });
        if (!periodeAwal) {
          throw new NotFoundError("Periode awal tidak ditemukan");
        }
      }

      if (data.periodeAkhirId) {
        const periodeAkhir = await prisma.periode.findUnique({
          where: { id: data.periodeAkhirId },
        });
        if (!periodeAkhir) {
          throw new NotFoundError("Periode akhir tidak ditemukan");
        }
      }

      // Create new voucher
      const newVoucher = await prisma.voucer.create({
        data: {
          nama: data.nama,
          kode: finalKode,
          nominal: data.nominal,
          periodeAwalId: data.periodeAwalId || null,
          periodeAkhirId: data.periodeAkhirId || null,
          tanggalExpired: data.tanggalExpired || null,
          anggaran: data.anggaran,
          realisasi: data.realisasi || null,
        },
        include: {
          periodeAwal: {
            select: {
              id: true,
              kode: true,
              namaPeriode: true,
              isAktif: true,
            },
          },
          periodeAkhir: {
            select: {
              id: true,
              kode: true,
              namaPeriode: true,
              isAktif: true,
            },
          },
        },
      });

      return {
        message: "Voucher berhasil ditambahkan",
        data: newVoucher,
        generatedCode: data.generateKodeOtomatis ? finalKode : null,
      };
    } catch (error) {
      console.error("Error in addVoucher:", error);

      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError("Gagal menambahkan voucher");
    }
  }

  async updateVoucher(
    id: Voucer["id"],
    data: {
      nama?: string;
      kode?: string;
      generateKodeOtomatis?: boolean;
      nominal?: number;
      periodeAwalId?: number;
      periodeAkhirId?: number;
      tanggalExpired?: Date | null;
      anggaran?: number;
      realisasi?: number | null;
    }
  ) {
    try {
      // Check if voucher exists
      const existingVoucher = await prisma.voucer.findUnique({
        where: { id },
      });

      if (!existingVoucher) {
        throw new NotFoundError("Voucher tidak ditemukan");
      }

      // Build update data object
      const updateData: any = {};
      let finalKode = data.kode;

      // Handle code generation if requested
      if (data.generateKodeOtomatis && data.nama) {
        finalKode = this.generateVoucherCode(data.nama);

        // Ensure the generated code is unique (excluding current voucher)
        let counter = 1;
        let baseCode = finalKode;
        while (await this.isKodeExistsExcluding(finalKode, id)) {
          finalKode = `${baseCode}${counter.toString().padStart(2, "0")}`;
          counter++;

          if (counter > 99) {
            throw new ConflictError("Tidak dapat membuat kode unik setelah 99 percobaan");
          }
        }
        updateData.kode = finalKode;
      } else if (data.kode !== undefined) {
        // Manual code validation (excluding current voucher)
        if (await this.isKodeExistsExcluding(data.kode, id)) {
          throw new ConflictError("Kode voucher sudah digunakan");
        }
        updateData.kode = data.kode;
      }

      // Add other fields to update
      if (data.nama !== undefined) updateData.nama = data.nama;
      if (data.nominal !== undefined) updateData.nominal = data.nominal;
      if (data.anggaran !== undefined) updateData.anggaran = data.anggaran;
      if (data.realisasi !== undefined) updateData.realisasi = data.realisasi;
      if (data.tanggalExpired !== undefined) updateData.tanggalExpired = data.tanggalExpired;
      if (data.periodeAwalId !== undefined) updateData.periodeAwalId = data.periodeAwalId;
      if (data.periodeAkhirId !== undefined) updateData.periodeAkhirId = data.periodeAkhirId;

      // Validate periode relationships if provided
      if (data.periodeAwalId) {
        const periodeAwal = await prisma.periode.findUnique({
          where: { id: data.periodeAwalId },
        });
        if (!periodeAwal) {
          throw new NotFoundError("Periode awal tidak ditemukan");
        }
      }

      if (data.periodeAkhirId) {
        const periodeAkhir = await prisma.periode.findUnique({
          where: { id: data.periodeAkhirId },
        });
        if (!periodeAkhir) {
          throw new NotFoundError("Periode akhir tidak ditemukan");
        }
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        throw new ConflictError("Minimal satu field harus diisi untuk update");
      }

      // Update voucher
      const updatedVoucher = await prisma.voucer.update({
        where: { id },
        data: updateData,
        include: {
          periodeAwal: {
            select: {
              id: true,
              kode: true,
              namaPeriode: true,
              isAktif: true,
            },
          },
          periodeAkhir: {
            select: {
              id: true,
              kode: true,
              namaPeriode: true,
              isAktif: true,
            },
          },
        },
      });

      return {
        message: "Voucher berhasil diperbarui",
        data: updatedVoucher,
        generatedCode: data.generateKodeOtomatis ? finalKode : null,
      };
    } catch (error) {
      console.error("Error in updateVoucher:", error);

      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal memperbarui voucher");
    }
  }

  async deleteVoucher(id: Voucer["id"]) {
    try {
      // Check if voucher exists first
      const existingVoucher = await prisma.voucer.findUnique({
        where: { id },
      });

      if (!existingVoucher) {
        throw new NotFoundError("Voucher tidak ditemukan");
      }

      // Use ForeignKeyHelper to handle delete with automatic foreign key checking
      const result = await ForeignKeyHelper.handleDelete(async () => {
        await prisma.voucer.delete({
          where: { id },
        });

        return {
          message: "Voucher berhasil dihapus",
          deletedRecord: {
            id: existingVoucher.id,
            kode: existingVoucher.kode,
            nama: existingVoucher.nama,
            nominal: existingVoucher.nominal,
            anggaran: existingVoucher.anggaran,
            realisasi: existingVoucher.realisasi,
            tanggalExpired: existingVoucher.tanggalExpired,
            periodeAwalId: existingVoucher.periodeAwalId,
            periodeAkhirId: existingVoucher.periodeAkhirId,
            createdAt: existingVoucher.createdAt,
            updatedAt: existingVoucher.updatedAt,
          },
        };
      }, "Voucher");

      return result;
    } catch (error) {
      console.error("Error in deleteVoucher:", error);

      // Handle known error types
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal menghapus voucher");
    }
  }

  async deleteVouchersBulk(ids: string[]) {
    try {
      if (!ids || ids.length === 0) {
        throw new BadRequestError("Tidak ada ID yang diberikan untuk dihapus");
      }

      // Validate all IDs exist
      const existingVouchers = await prisma.voucer.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
          kode: true,
          nama: true,
          nominal: true,
          anggaran: true,
          realisasi: true,
          tanggalExpired: true,
          periodeAwalId: true,
          periodeAkhirId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Check if all IDs exist
      const foundIds = existingVouchers.map((voucher) => voucher.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundError(`Voucher dengan ID ${notFoundIds.join(", ")} tidak ditemukan`);
      }

      // Use ForeignKeyHelper to handle bulk delete with foreign key checking
      const result = await ForeignKeyHelper.handleDelete(async () => {
        const deleteResult = await prisma.voucer.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

        return {
          message: `${deleteResult.count} voucher berhasil dihapus`,
          deletedCount: deleteResult.count,
          deletedIds: ids,
          deletedRecords: existingVouchers,
        };
      }, "Voucher");

      return result;
    } catch (error) {
      console.error("Error in deleteVouchersBulk:", error);

      if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal menghapus voucher secara bulk");
    }
  }

  // Helper method to check if code exists excluding current voucher
  private async isKodeExistsExcluding(kode: string, excludeId: string): Promise<boolean> {
    const existingVoucher = await prisma.voucer.findFirst({
      where: {
        AND: [{ kode }, { id: { not: excludeId } }],
      },
    });
    return !!existingVoucher;
  }

  // Helper function to generate automatic voucher code
  private generateVoucherCode(nama: string): string {
    const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year

    // Split nama into words and process each word
    const words = nama.trim().split(/\s+/);
    let codePrefix = "";

    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

      if (cleanWord.length === 0) continue;

      // Convert each word to 3-character abbreviation
      let wordAbbrev = "";

      if (cleanWord.length <= 3) {
        // For short words (3 chars or less), use as is
        wordAbbrev = cleanWord;
      } else {
        // For longer words, take first 3 characters
        // But prioritize consonants for better readability
        const consonants = cleanWord.replace(/[AEIOU]/g, "");

        if (consonants.length >= 3) {
          // If we have enough consonants, use first 3 consonants
          wordAbbrev = consonants.substring(0, 3);
        } else if (consonants.length >= 2) {
          // If we have 2 consonants, add first vowel
          const vowels = cleanWord.replace(/[^AEIOU]/g, "");
          wordAbbrev = consonants.substring(0, 2) + (vowels.length > 0 ? vowels[0] : cleanWord[2]);
        } else {
          // Fallback: just take first 3 characters
          wordAbbrev = cleanWord.substring(0, 3);
        }
      }

      codePrefix += wordAbbrev;

      // Limit total prefix length to avoid too long codes
      if (codePrefix.length >= 9) break;
    }

    // Ensure we have at least some characters
    if (codePrefix.length === 0) {
      codePrefix = "VCH";
    }

    // Add university identifier and year
    const finalCode = `${codePrefix}UIKA${currentYear}`;

    return finalCode.substring(0, 15); // Limit to reasonable length
  }

  // Helper method to check if code exists
  private async isKodeExists(kode: string): Promise<boolean> {
    const existingVoucher = await prisma.voucer.findUnique({
      where: { kode },
    });
    return !!existingVoucher;
  }
}

export class AturanVoucherService {
  async addAturanVoucher(voucerId: string, data: { jenisTagihanId: string; maksimalNominal: number }) {
    try {
      // Validate voucher exists
      const voucher = await prisma.voucer.findUnique({
        where: { id: voucerId },
        select: { id: true, nama: true },
      });

      if (!voucher) {
        throw new NotFoundError("Voucher tidak ditemukan");
      }

      // Validate jenisTagihan exists
      const jenisTagihan = await prisma.jenisTagihan.findUnique({
        where: { id: data.jenisTagihanId },
        select: {
          id: true,
          kode: true,
          namaJenisTagihan: true,
        },
      });

      if (!jenisTagihan) {
        throw new NotFoundError("Jenis tagihan tidak ditemukan");
      }

      // Check if this jenisTagihan is already used in this voucher
      const existingAturan = await prisma.aturanVoucher.findFirst({
        where: {
          voucerId: voucerId,
          jenisTagihanId: data.jenisTagihanId,
        },
      });

      if (existingAturan) {
        throw new ConflictError("Jenis tagihan sudah digunakan dalam aturan voucher ini");
      }

      // Create aturan voucher
      const newAturanVoucher = await prisma.aturanVoucher.create({
        data: {
          voucerId: voucerId,
          jenisTagihanId: data.jenisTagihanId,
          maksimalNominal: data.maksimalNominal,
        },
        include: {
          voucer: {
            select: {
              id: true,
              nama: true,
              kode: true,
              nominal: true,
              anggaran: true,
            },
          },
          jenisTagihan: {
            select: {
              id: true,
              kode: true,
              namaJenisTagihan: true,
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
                },
              },
            },
          },
        },
      });

      return {
        message: "Aturan voucher berhasil ditambahkan",
        data: newAturanVoucher,
      };
    } catch (error) {
      console.error("Error in addAturanVoucher:", error);

      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal menambahkan aturan voucher");
    }
  }

  async getAllAturanVoucher(voucherId: string) {
    try {
      // Validate voucher exists
      const voucher = await prisma.voucer.findUnique({
        where: { id: voucherId },
        select: { id: true, nama: true, kode: true, nominal: true, anggaran: true },
      });

      if (!voucher) {
        throw new NotFoundError("Voucher tidak ditemukan");
      }

      // Get all aturan voucher for this voucher
      const aturanVoucher = await prisma.aturanVoucher.findMany({
        where: { voucerId: voucher.id },
        include: {
          jenisTagihan: {
            select: {
              id: true,
              kode: true,
              namaJenisTagihan: true,
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
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return {
        message: "Data aturan voucher berhasil diambil",
        voucher,
        data: aturanVoucher,
      };
    } catch (error) {
      console.error("Error in getAllAturanVoucher:", error);

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError("Gagal mengambil data aturan voucher");
    }
  }

  async updateAturanVoucher(id: string, data: { jenisTagihanId?: string; maksimalNominal?: number }) {
    try {
      // Check if aturan voucher exists
      const existing = await prisma.aturanVoucher.findUnique({
        where: { id },
        select: {
          id: true,
          voucerId: true,
          jenisTagihanId: true,
          maksimalNominal: true,
        },
      });

      if (!existing) {
        throw new NotFoundError("Aturan voucher tidak ditemukan");
      }

      // Build update data object - only include provided fields
      const updateData: any = {};

      // Handle jenisTagihanId update
      if (data.jenisTagihanId !== undefined) {
        // Validate jenisTagihan exists
        const jenisTagihan = await prisma.jenisTagihan.findUnique({
          where: { id: data.jenisTagihanId },
          select: { id: true, kode: true, namaJenisTagihan: true },
        });

        if (!jenisTagihan) {
          throw new NotFoundError("Jenis tagihan tidak ditemukan");
        }

        // Check if new jenisTagihan is already used in this voucher (except current record)
        const conflictingAturan = await prisma.aturanVoucher.findFirst({
          where: {
            voucerId: existing.voucerId,
            jenisTagihanId: data.jenisTagihanId,
            NOT: { id },
          },
        });

        if (conflictingAturan) {
          throw new ConflictError("Jenis tagihan sudah digunakan dalam aturan voucher ini");
        }

        updateData.jenisTagihanId = data.jenisTagihanId;
      }

      // Handle maksimalNominal update
      if (data.maksimalNominal !== undefined) {
        updateData.maksimalNominal = data.maksimalNominal;
      }

      // Check if there's at least one field to update
      if (Object.keys(updateData).length === 0) {
        throw new ConflictError("Minimal satu field harus diisi untuk update");
      }

      // Update aturan voucher
      const updatedAturan = await prisma.aturanVoucher.update({
        where: { id },
        data: updateData,
        include: {
          voucer: {
            select: {
              id: true,
              nama: true,
              kode: true,
              nominal: true,
              anggaran: true,
            },
          },
          jenisTagihan: {
            select: {
              id: true,
              kode: true,
              namaJenisTagihan: true,
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
                },
              },
            },
          },
        },
      });

      return {
        message: "Aturan voucher berhasil diperbarui",
        data: updatedAturan,
      };
    } catch (error) {
      console.error("Error in updateAturanVoucher:", error);

      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal memperbarui aturan voucher");
    }
  }

  async deleteAturanVoucher(id: string) {
    try {
      // Check if aturan voucher exists
      const existing = await prisma.aturanVoucher.findUnique({
        where: { id },
        include: {
          voucer: {
            select: { id: true, nama: true, kode: true },
          },
          jenisTagihan: {
            select: { id: true, kode: true, namaJenisTagihan: true },
          },
        },
      });

      if (!existing) {
        throw new NotFoundError("Aturan voucher tidak ditemukan");
      }

      // Use ForeignKeyHelper to handle delete with automatic foreign key checking
      const result = await ForeignKeyHelper.handleDelete(async () => {
        await prisma.aturanVoucher.delete({
          where: { id },
        });

        return {
          message: "Aturan voucher berhasil dihapus",
          deletedRecord: existing,
        };
      }, "AturanVoucher");

      return result;
    } catch (error) {
      console.error("Error in deleteAturanVoucher:", error);

      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal menghapus aturan voucher");
    }
  }
}
