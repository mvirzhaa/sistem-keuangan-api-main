import { prisma } from "../../../config/database.js";
import { AturanPotongan, JenisTagihan, Potongan } from "@prisma/client";
import { ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

export class PotonganService {
  async getAllPotongan(params: { page?: number; limit?: number; searchBy?: string; searchValue?: string; filterJenisPotongan?: string; filterJenisTagihan?: string; filterRekanan?: number | undefined; filterTipePotongan?: string }) {
    try {
      const { page = 1, limit = 10, searchBy = "all", searchValue = "", filterJenisPotongan, filterJenisTagihan, filterRekanan, filterTipePotongan } = params;

      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = limit;

      // Build where clause
      const whereClause: any = {};

      // Add filter conditions
      if (filterJenisPotongan && filterJenisPotongan !== "all") {
        whereClause.jenisPotongan = filterJenisPotongan;
      }

      if (filterJenisTagihan && filterJenisTagihan !== "all") {
        whereClause.jenisTagihanId = filterJenisTagihan;
      }

      if (filterRekanan) {
        whereClause.rekananId = filterRekanan;
      }

      if (filterTipePotongan && filterTipePotongan !== "all") {
        whereClause.tipePotongan = filterTipePotongan;
      }

      // Add search conditions
      if (searchValue && searchValue.trim() !== "") {
        const searchConditions = [];

        if (searchBy === "all") {
          // Search across multiple fields
          searchConditions.push(
            { nama: { contains: searchValue, mode: "insensitive" } },
            { periodeAwal: { namaPeriode: { contains: searchValue, mode: "insensitive" } } },
            { periodeAkhir: { namaPeriode: { contains: searchValue, mode: "insensitive" } } },
            { rekanan: { nama: { contains: searchValue, mode: "insensitive" } } }
          );

          // Handle numeric search for nominal, anggaran, jumlahPenerima, realisasi
          const numericValue = parseFloat(searchValue);
          if (!isNaN(numericValue)) {
            searchConditions.push({ nominal: { equals: numericValue } }, { anggaran: { equals: numericValue } }, { jumlahPenerima: { equals: Math.floor(numericValue) } }, { realisasi: { equals: numericValue } });
          }
        } else {
          // Search by specific field
          switch (searchBy) {
            case "nama":
              searchConditions.push({ nama: { contains: searchValue, mode: "insensitive" } });
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
            case "nominal":
              const nominalValue = parseFloat(searchValue);
              if (!isNaN(nominalValue)) {
                searchConditions.push({ nominal: { equals: nominalValue } });
              }
              break;
            case "anggaran":
              const anggaranValue = parseFloat(searchValue);
              if (!isNaN(anggaranValue)) {
                searchConditions.push({ anggaran: { equals: anggaranValue } });
              }
              break;
            case "jumlahPenerima":
              const jumlahValue = parseInt(searchValue);
              if (!isNaN(jumlahValue)) {
                searchConditions.push({ jumlahPenerima: { equals: jumlahValue } });
              }
              break;
            case "realisasi":
              const realisasiValue = parseFloat(searchValue);
              if (!isNaN(realisasiValue)) {
                searchConditions.push({ realisasi: { equals: realisasiValue } });
              }
              break;
            case "memotongTagihan":
              const isMemotongValue = searchValue.toLowerCase() === "true" || searchValue === "1";
              searchConditions.push({ isMemotongTagihan: isMemotongValue });
              break;
            case "tipePotongan":
              searchConditions.push({ tipePotongan: { equals: searchValue as any } });
              break;
            case "rekanan":
              searchConditions.push({
                rekanan: {
                  nama: { contains: searchValue, mode: "insensitive" },
                },
              });
              break;
          }
        }

        if (searchConditions.length > 0) {
          whereClause.OR = searchConditions;
        }
      }

      // Get data with pagination
      const [data, total] = await Promise.all([
        prisma.potongan.findMany({
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
            rekanan: {
              select: {
                id: true,
                nama: true,
                kota: true,
                telepon: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.potongan.count({
          where: whereClause,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        message: "Data potongan berhasil diambil",
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
      console.error("Error in getAllPotongan:", error);
      throw new InternalServerError("Gagal mengambil data potongan");
    }
  }

  async getPotonganById(id: Potongan["id"]) {
    try {
      // Find potongan by ID
      const potongan = await prisma.potongan.findUnique({
        where: { id },
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
          rekanan: {
            select: {
              id: true,
              nama: true,
              kota: true,
              telepon: true,
              email: true,
            },
          },
        },
      });

      if (!potongan) {
        throw new NotFoundError("Potongan tidak ditemukan");
      }

      return {
        message: "Data potongan berhasil diambil",
        data: potongan,
      };
    } catch (error) {
      console.error("Error in getPotonganById:", error);
      throw new InternalServerError("Gagal mengambil data potongan");
    }
  }

  async getSearchFields() {
    try {
      const searchFields = [
        {
          name: "nama",
          label: "Nama Potongan",
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
          name: "nominal",
          label: "Nominal Potongan",
        },
        {
          name: "anggaran",
          label: "Anggaran",
        },
        {
          name: "jumlahPenerima",
          label: "Jumlah Penerima",
        },
        {
          name: "realisasi",
          label: "Realisasi",
        },
        {
          name: "memotongTagihan",
          label: "MemotongTagihan?",
        },
        {
          name: "tipePotongan",
          label: "Tipe Potongan",
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

  async addPotongan(data: Omit<Potongan, "id" | "createdAt" | "updatedAt">) {
    try {
      // Validasi periode awal jika ada
      if (data.periodeAwalId) {
        const periodeAwal = await prisma.periode.findUnique({
          where: { id: data.periodeAwalId },
        });

        if (!periodeAwal) {
          throw new InternalServerError("Periode awal tidak ditemukan");
        }
      }

      // Validasi periode akhir jika ada
      if (data.periodeAkhirId) {
        const periodeAkhir = await prisma.periode.findUnique({
          where: { id: data.periodeAkhirId },
        });

        if (!periodeAkhir) {
          throw new InternalServerError("Periode akhir tidak ditemukan");
        }
      }

      // Validasi rekanan jika ada
      if (data.rekananId) {
        const rekanan = await prisma.rekanan.findUnique({
          where: { id: data.rekananId },
        });

        if (!rekanan) {
          throw new InternalServerError("Rekanan tidak ditemukan");
        }
      }

      // Create potongan
      const newPotongan = await prisma.potongan.create({
        data: {
          ...data,
          realisasi: data.realisasi || 0,
          isMemotongTagihan: data.isMemotongTagihan || false,
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
          rekanan: {
            select: {
              id: true,
              nama: true,
              kota: true,
              telepon: true,
              email: true,
            },
          },
        },
      });

      return {
        message: "Potongan berhasil ditambahkan",
        data: newPotongan,
      };
    } catch (error) {
      console.error("Error in addPotongan:", error);

      if (error instanceof InternalServerError) {
        throw error;
      }

      throw new InternalServerError("Gagal menambahkan potongan");
    }
  }

  async deletePotongan(id: Potongan["id"]) {
    try {
      // Check if potongan exists
      const existing = await prisma.potongan.findUnique({
        where: { id },
        select: {
          id: true,
          nama: true,
        },
      });

      if (!existing) {
        throw new NotFoundError("Potongan tidak ditemukan");
      }

      // Delete the potongan
      await prisma.potongan.delete({
        where: { id },
      });

      return {
        message: "Potongan berhasil dihapus",
        deletedRecord: existing,
      };
    } catch (error) {
      console.error("Error in deletePotongan:", error);

      if (error instanceof InternalServerError || error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError("Gagal menghapus potongan");
    }
  }

  async deletePotonganBulk(ids: Potongan["id"][]) {
    try {
      if (!ids || ids.length === 0) {
        throw new NotFoundError("Tidak ada ID yang diberikan untuk dihapus");
      }

      // Validate all IDs exist
      const existingRecords = await prisma.potongan.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
          nama: true,
        },
      });

      // Check if all IDs exist
      const foundIds = existingRecords.map((record) => record.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundError(`Potongan dengan ID ${notFoundIds.join(", ")} tidak ditemukan`);
      }

      // Delete the records
      const result = await prisma.potongan.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      return {
        message: `${result.count} potongan berhasil dihapus`,
        deletedCount: result.count,
        deletedIds: ids,
        deletedRecords: existingRecords,
      };
    } catch (error) {
      console.error("Error in deletePotonganBulk:", error);

      if (error instanceof InternalServerError || error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError("Gagal menghapus potongan");
    }
  }

  async updatePotongan(id: Potongan["id"], data: Partial<Omit<Potongan, "id" | "createdAt" | "updatedAt">>) {
    try {
      // Check if potongan exists
      const existing = await prisma.potongan.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundError("Potongan tidak ditemukan");
      }

      // Validasi periode awal jika ada dalam update
      if (data.periodeAwalId) {
        const periodeAwal = await prisma.periode.findUnique({
          where: { id: data.periodeAwalId },
        });

        if (!periodeAwal) {
          throw new InternalServerError("Periode awal tidak ditemukan");
        }
      }

      // Validasi periode akhir jika ada dalam update
      if (data.periodeAkhirId) {
        const periodeAkhir = await prisma.periode.findUnique({
          where: { id: data.periodeAkhirId },
        });

        if (!periodeAkhir) {
          throw new InternalServerError("Periode akhir tidak ditemukan");
        }
      }

      // Validasi rekanan jika ada dalam update
      if (data.rekananId) {
        const rekanan = await prisma.rekanan.findUnique({
          where: { id: data.rekananId },
        });

        if (!rekanan) {
          throw new InternalServerError("Rekanan tidak ditemukan");
        }
      }

      // Build update data object - only include provided fields
      const updateData: any = {};

      if (data.nama !== undefined) updateData.nama = data.nama;
      if (data.periodeAwalId !== undefined) updateData.periodeAwalId = data.periodeAwalId;
      if (data.periodeAkhirId !== undefined) updateData.periodeAkhirId = data.periodeAkhirId;
      if (data.nominal !== undefined) updateData.nominal = data.nominal;
      if (data.anggaran !== undefined) updateData.anggaran = data.anggaran;
      if (data.jenisPotongan !== undefined) updateData.jenisPotongan = data.jenisPotongan;
      if (data.rekananId !== undefined) updateData.rekananId = data.rekananId;
      if (data.jumlahPenerima !== undefined) updateData.jumlahPenerima = data.jumlahPenerima;
      if (data.realisasi !== undefined) updateData.realisasi = data.realisasi;
      if (data.isMemotongTagihan !== undefined) updateData.isMemotongTagihan = data.isMemotongTagihan;
      if (data.tipePotongan !== undefined) updateData.tipePotongan = data.tipePotongan;

      // Update potongan
      const updatedPotongan = await prisma.potongan.update({
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
          rekanan: {
            select: {
              id: true,
              nama: true,
              kota: true,
              telepon: true,
              email: true,
            },
          },
        },
      });

      return {
        message: "Potongan berhasil diperbarui",
        data: updatedPotongan,
      };
    } catch (error) {
      console.error("Error in updatePotongan:", error);

      if (error instanceof InternalServerError || error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError("Gagal memperbarui potongan");
    }
  }

  async importPotonganFromExcel(buffer: Buffer) {
    try {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Validate required sheets
      const requiredSheets = ["Format Isian", "Daftar Periode", "Daftar Rekanan", "Tipe Potongan", "Jenis Potongan"];
      const availableSheets = workbook.SheetNames;

      const missingSheets = requiredSheets.filter((sheet) => !availableSheets.includes(sheet));
      if (missingSheets.length > 0) {
        throw new InternalServerError(`Sheet yang diperlukan tidak ditemukan: ${missingSheets.join(", ")}`);
      }

      // Parse reference data from sheets
      const periodeSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Daftar Periode"]!);
      const rekananSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Daftar Rekanan"]!);
      const tipePotonganSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Tipe Potongan"]!);
      const jenisPotonganSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Jenis Potongan"]!);

      // Create lookup maps for validation
      const periodeLookup = new Map();
      periodeSheet.forEach((row: any) => {
        if (row["Kode Periode"] && row["Nama Periode"]) {
          periodeLookup.set(row["Kode Periode"], row);
        }
      });

      const rekananLookup = new Map();
      rekananSheet.forEach((row: any) => {
        if (row["ID Rekanan"] && row["Nama Rekanan"]) {
          rekananLookup.set(parseInt(row["ID Rekanan"]), row);
        }
      });

      const tipePotonganLookup = new Map();
      tipePotonganSheet.forEach((row: any) => {
        if (row["Kode Tipe Potongan"] && row["Nama Tipe Potongan"]) {
          tipePotonganLookup.set(row["Kode Tipe Potongan"], row);
        }
      });

      const jenisPotonganLookup = new Map();
      jenisPotonganSheet.forEach((row: any) => {
        if (row["Kode Jenis Potongan"] && row["Nama Jenis Potongan"]) {
          jenisPotonganLookup.set(row["Kode Jenis Potongan"], row);
        }
      });

      // Parse main data from Format Isian sheet
      const formatIsianSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Format Isian"]!);

      if (formatIsianSheet.length === 0) {
        throw new InternalServerError("Tidak ada data untuk diimport pada sheet 'Format Isian'");
      }

      // Validate and prepare data for import
      const validationErrors: string[] = [];
      const importData: Omit<Potongan, "id" | "createdAt" | "updatedAt">[] = [];

      for (let i = 0; i < formatIsianSheet.length; i++) {
        const row = formatIsianSheet[i] as any;
        const rowNum = i + 2; // Excel row number (header is row 1)

        try {
          // Validate required fields
          if (!row["Nama Potongan"]) {
            validationErrors.push(`Baris ${rowNum}: Nama Potongan wajib diisi`);
            continue;
          }

          if (!row["Nominal"] || isNaN(parseFloat(row["Nominal"]))) {
            validationErrors.push(`Baris ${rowNum}: Nominal harus berupa angka yang valid`);
            continue;
          }

          if (!row["Anggaran"] || isNaN(parseFloat(row["Anggaran"]))) {
            validationErrors.push(`Baris ${rowNum}: Anggaran harus berupa angka yang valid`);
            continue;
          }

          if (!row["Jenis Potongan (Lihat kode pada jenis potongan)"]) {
            validationErrors.push(`Baris ${rowNum}: Jenis Potongan wajib diisi`);
            continue;
          }

          if (!row["Tipe Potongan (Lihat Work Sheet - Tipe Potongan)"]) {
            validationErrors.push(`Baris ${rowNum}: Tipe Potongan wajib diisi`);
            continue;
          }

          // Validate Jenis Potongan
          const jenisPotonganCode = row["Jenis Potongan (Lihat kode pada jenis potongan)"];
          if (!jenisPotonganLookup.has(jenisPotonganCode)) {
            validationErrors.push(`Baris ${rowNum}: Jenis Potongan '${jenisPotonganCode}' tidak valid. Lihat sheet 'Jenis Potongan'`);
            continue;
          }

          // Validate Tipe Potongan
          const tipePotonganCode = row["Tipe Potongan (Lihat Work Sheet - Tipe Potongan)"];
          if (!tipePotonganLookup.has(tipePotonganCode)) {
            validationErrors.push(`Baris ${rowNum}: Tipe Potongan '${tipePotonganCode}' tidak valid. Lihat sheet 'Tipe Potongan'`);
            continue;
          }

          // Map Jenis Potongan code to enum
          let jenisPotongan: "POTONGAN" | "BEASISWA";
          if (jenisPotonganCode === "POT") {
            jenisPotongan = "POTONGAN";
          } else if (jenisPotonganCode === "BEA") {
            jenisPotongan = "BEASISWA";
          } else {
            validationErrors.push(`Baris ${rowNum}: Jenis Potongan '${jenisPotonganCode}' tidak didukung. Gunakan POT atau BEA`);
            continue;
          }

          // Map Tipe Potongan code to enum
          let tipePotongan: "POTONGAN_RATA" | "POTONGAN_AWAL";
          if (tipePotonganCode === "PR") {
            tipePotongan = "POTONGAN_RATA";
          } else if (tipePotonganCode === "PA") {
            tipePotongan = "POTONGAN_AWAL";
          } else {
            validationErrors.push(`Baris ${rowNum}: Tipe Potongan '${tipePotonganCode}' tidak didukung. Gunakan PR atau PA`);
            continue;
          }

          // Validate and get Periode Awal ID
          let periodeAwalId: number | null = null;
          if (row["Periode Awal (Lihat Kode Pada Daftar Periode)"]) {
            const periodeAwalCode = row["Periode Awal (Lihat Kode Pada Daftar Periode)"];
            if (!periodeLookup.has(periodeAwalCode)) {
              validationErrors.push(`Baris ${rowNum}: Kode Periode Awal '${periodeAwalCode}' tidak ditemukan. Lihat sheet 'Daftar Periode'`);
              continue;
            }

            // Find periode ID in database
            const periodeAwal = await prisma.periode.findUnique({
              where: { kode: periodeAwalCode },
              select: { id: true },
            });

            if (!periodeAwal) {
              validationErrors.push(`Baris ${rowNum}: Periode dengan kode '${periodeAwalCode}' tidak ditemukan di database`);
              continue;
            }

            periodeAwalId = periodeAwal.id;
          }

          // Validate and get Periode Akhir ID
          let periodeAkhirId: number | null = null;
          if (row["Periode Akhir (Lihat Kode Pada Daftar Periode)"]) {
            const periodeAkhirCode = row["Periode Akhir (Lihat Kode Pada Daftar Periode)"];
            if (!periodeLookup.has(periodeAkhirCode)) {
              validationErrors.push(`Baris ${rowNum}: Kode Periode Akhir '${periodeAkhirCode}' tidak ditemukan. Lihat sheet 'Daftar Periode'`);
              continue;
            }

            // Find periode ID in database
            const periodeAkhir = await prisma.periode.findUnique({
              where: { kode: periodeAkhirCode },
              select: { id: true },
            });

            if (!periodeAkhir) {
              validationErrors.push(`Baris ${rowNum}: Periode dengan kode '${periodeAkhirCode}' tidak ditemukan di database`);
              continue;
            }

            periodeAkhirId = periodeAkhir.id;
          }

          // Validate and get Rekanan ID
          let rekananId: number | null = null;
          if (row["ID Rekanan (Lihat Daftar Rekanan)"]) {
            const rekananIdFromExcel = parseInt(row["ID Rekanan (Lihat Daftar Rekanan)"]);
            if (isNaN(rekananIdFromExcel)) {
              validationErrors.push(`Baris ${rowNum}: ID Rekanan harus berupa angka yang valid`);
              continue;
            }

            if (!rekananLookup.has(rekananIdFromExcel)) {
              validationErrors.push(`Baris ${rowNum}: ID Rekanan '${rekananIdFromExcel}' tidak ditemukan. Lihat sheet 'Daftar Rekanan'`);
              continue;
            }

            // Validate rekanan exists in database
            const rekanan = await prisma.rekanan.findUnique({
              where: { id: rekananIdFromExcel },
              select: { id: true },
            });

            if (!rekanan) {
              validationErrors.push(`Baris ${rowNum}: Rekanan dengan ID '${rekananIdFromExcel}' tidak ditemukan di database`);
              continue;
            }

            rekananId = rekananIdFromExcel;
          }

          // Parse optional fields
          const jumlahPenerima = row["Jumlah Penerima"] ? parseInt(row["Jumlah Penerima"]) : null;
          if (row["Jumlah Penerima"] && isNaN(jumlahPenerima!)) {
            validationErrors.push(`Baris ${rowNum}: Jumlah Penerima harus berupa angka yang valid`);
            continue;
          }

          const realisasi = row["Realisasi"] ? parseInt(row["Realisasi"]) : null;
          if (row["Realisasi"] && isNaN(realisasi!)) {
            validationErrors.push(`Baris ${rowNum}: Realisasi harus berupa angka yang valid`);
            continue;
          }

          // Parse boolean field
          let isMemotongTagihan = false;
          if (row["Memotong Tagihan? (1 = Ya, 0 = Tidak)"]) {
            const memotongValue = row["Memotong Tagihan? (1 = Ya, 0 = Tidak)"];
            if (memotongValue === 1 || memotongValue === "1" || memotongValue === "Ya" || memotongValue === "ya") {
              isMemotongTagihan = true;
            } else if (memotongValue === 0 || memotongValue === "0" || memotongValue === "Tidak" || memotongValue === "tidak") {
              isMemotongTagihan = false;
            } else {
              validationErrors.push(`Baris ${rowNum}: Memotong Tagihan harus berupa 1/0 atau Ya/Tidak`);
              continue;
            }
          }

          // Create import data object
          const potonganData: Omit<Potongan, "id" | "createdAt" | "updatedAt"> = {
            nama: row["Nama Potongan"].toString().trim(),
            periodeAwalId,
            periodeAkhirId,
            nominal: parseInt(row["Nominal"]),
            anggaran: parseInt(row["Anggaran"]),
            jenisPotongan,
            rekananId,
            jumlahPenerima,
            realisasi,
            isMemotongTagihan,
            tipePotongan,
            // jenisTagihanId: null, // Set to null or handle if needed
          };

          importData.push(potonganData);
        } catch (error) {
          validationErrors.push(`Baris ${rowNum}: Error parsing data - ${error}`);
        }
      }

      // If there are validation errors, return them
      if (validationErrors.length > 0) {
        throw new InternalServerError(`Validasi gagal:\n${validationErrors.join("\n")}`);
      }

      // Import data to database in transaction
      const importedData = await prisma.$transaction(async (tx) => {
        const results = [];

        for (const data of importData) {
          const result = await tx.potongan.create({
            data,
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
              rekanan: {
                select: {
                  id: true,
                  nama: true,
                  kota: true,
                  telepon: true,
                  email: true,
                },
              },
            },
          });

          results.push(result);
        }

        return results;
      });

      return {
        message: `${importedData.length} data potongan berhasil diimport`,
        importedCount: importedData.length,
        data: importedData,
      };
    } catch (error) {
      console.error("Error in importPotonganFromExcel:", error);

      if (error instanceof InternalServerError) {
        throw error;
      }

      throw new InternalServerError("Gagal mengimport data potongan dari Excel");
    }
  }

  async downloadTemplateExcel() {
    try {
      // Path to template file in project
      const templatePath = path.join(process.cwd(), "src", "templates", "template-import-potongan.xlsx");

      // Check if template file exists
      if (!fs.existsSync(templatePath)) {
        throw new InternalServerError("Template file tidak ditemukan. Pastikan file template-import-potongan.xlsx ada di folder src/templates/");
      }

      // Read template file
      const buffer = fs.readFileSync(templatePath);

      return {
        message: "Template Excel berhasil didownload",
        buffer,
        filename: `template-import-potongan-${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    } catch (error) {
      console.error("Error in downloadTemplateExcel:", error);

      if (error instanceof InternalServerError) {
        throw error;
      }

      throw new InternalServerError("Gagal mendownload template Excel");
    }
  }
}

export class AturanPotonganService {
  async addAturanPotongan(potonganId: Potongan["id"], data: Omit<AturanPotongan, "id" | "createdAt" | "updatedAt">) {
    try {
      // Validate potongan exists
      const potongan = await prisma.potongan.findUnique({
        where: { id: potonganId },
        select: { id: true, nama: true },
      });

      if (!potongan) {
        throw new NotFoundError("Potongan tidak ditemukan");
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

      // Check if this jenisTagihan is already used in this potongan
      const existingAturan = await prisma.aturanPotongan.findFirst({
        where: {
          potonganId,
          jenisTagihanId: data.jenisTagihanId,
        },
      });

      if (existingAturan) {
        throw new ConflictError("Jenis tagihan sudah digunakan dalam aturan potongan ini");
      }

      // Auto-generate nomorUrut if not provided
      let nomorUrut = data.nomorUrut;
      if (!nomorUrut) {
        const lastAturan = await prisma.aturanPotongan.findFirst({
          where: { potonganId },
          orderBy: { nomorUrut: "desc" },
          select: { nomorUrut: true },
        });

        nomorUrut = lastAturan ? lastAturan.nomorUrut + 1 : 1;
      } else {
        // Validate nomorUrut is not already taken for this potongan
        const existingUrut = await prisma.aturanPotongan.findFirst({
          where: {
            potonganId,
            nomorUrut,
          },
        });

        if (existingUrut) {
          throw new InternalServerError(`Nomor urut ${nomorUrut} sudah digunakan dalam potongan ini`);
        }
      }

      // Create aturan potongan
      const newAturanPotongan = await prisma.aturanPotongan.create({
        data: {
          potonganId,
          jenisTagihanId: data.jenisTagihanId,
          nomorUrut,
          maksimalNominal: data.maksimalNominal,
        },
        include: {
          potongan: {
            select: {
              id: true,
              nama: true,
              jenisPotongan: true,
              tipePotongan: true,
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
        message: "Aturan potongan berhasil ditambahkan",
        data: newAturanPotongan,
      };
    } catch (error) {
      console.error("Error in addAturanPotongan:", error);

      if (error instanceof InternalServerError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal menambahkan aturan potongan");
    }
  }

  async getAllAturanPotongan(potonganId: Potongan["id"]) {
    try {
      // Validate potongan exists
      const potongan = await prisma.potongan.findUnique({
        where: { id: potonganId },
        select: { id: true, nama: true },
      });

      if (!potongan) {
        throw new NotFoundError("Potongan tidak ditemukan");
      }

      // Get all aturan potongan for this potongan
      const aturanPotongan = await prisma.aturanPotongan.findMany({
        where: { potonganId },
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
        orderBy: { nomorUrut: "asc" },
      });

      return {
        message: "Data aturan potongan berhasil diambil",
        potongan,
        data: aturanPotongan,
      };
    } catch (error) {
      console.error("Error in getAllAturanPotongan:", error);

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError("Gagal mengambil data aturan potongan");
    }
  }

  async updateAturanPotongan(id: AturanPotongan["id"], data: Partial<Omit<AturanPotongan, "id" | "createdAt" | "updatedAt" | "potonganId">>) {
    try {
      // Check if aturan potongan exists
      const existing = await prisma.aturanPotongan.findUnique({
        where: { id },
        select: {
          id: true,
          potonganId: true,
          jenisTagihanId: true,
          nomorUrut: true,
          maksimalNominal: true,
        },
      });

      if (!existing) {
        throw new NotFoundError("Aturan potongan tidak ditemukan");
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
          throw new InternalServerError("Jenis tagihan tidak ditemukan");
        }

        // Check if new jenisTagihan is already used in this potongan (except current record)
        const conflictingAturan = await prisma.aturanPotongan.findFirst({
          where: {
            potonganId: existing.potonganId,
            jenisTagihanId: data.jenisTagihanId,
            NOT: { id },
          },
        });

        if (conflictingAturan) {
          throw new ConflictError("Jenis tagihan sudah digunakan dalam aturan potongan ini");
        }

        updateData.jenisTagihanId = data.jenisTagihanId;
      }

      // Handle nomorUrut update
      if (data.nomorUrut !== undefined) {
        // Check if new nomorUrut is already taken for this potongan (except current record)
        const conflictingUrut = await prisma.aturanPotongan.findFirst({
          where: {
            potonganId: existing.potonganId,
            nomorUrut: data.nomorUrut,
            NOT: { id },
          },
        });

        if (conflictingUrut) {
          throw new ConflictError(`Nomor urut ${data.nomorUrut} sudah digunakan dalam potongan ini`);
        }

        updateData.nomorUrut = data.nomorUrut;
      }

      // Handle maksimalNominal update
      if (data.maksimalNominal !== undefined) {
        updateData.maksimalNominal = data.maksimalNominal;
      }

      // Check if there's at least one field to update
      if (Object.keys(updateData).length === 0) {
        throw new InternalServerError("Minimal satu field harus diisi untuk update");
      }

      // Update aturan potongan
      const updatedAturan = await prisma.aturanPotongan.update({
        where: { id },
        data: updateData,
        include: {
          potongan: {
            select: {
              id: true,
              nama: true,
              jenisPotongan: true,
              tipePotongan: true,
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
        message: "Aturan potongan berhasil diperbarui",
        data: updatedAturan,
      };
    } catch (error) {
      console.error("Error in updateAturanPotongan:", error);

      if (error instanceof InternalServerError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      throw new InternalServerError("Gagal memperbarui aturan potongan");
    }
  }

  async deleteAturanPotongan(id: AturanPotongan["id"]) {
    try {
      // Check if aturan potongan exists
      const existing = await prisma.aturanPotongan.findUnique({
        where: { id },
        include: {
          potongan: {
            select: { id: true, nama: true },
          },
          jenisTagihan: {
            select: { id: true, kode: true, namaJenisTagihan: true },
          },
        },
      });

      if (!existing) {
        throw new NotFoundError("Aturan potongan tidak ditemukan");
      }

      // Delete the aturan potongan
      await prisma.aturanPotongan.delete({
        where: { id },
      });

      return {
        message: "Aturan potongan berhasil dihapus",
        deletedRecord: existing,
      };
    } catch (error) {
      console.error("Error in deleteAturanPotongan:", error);

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError("Gagal menghapus aturan potongan");
    }
  }
}
