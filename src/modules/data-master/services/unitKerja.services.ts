import { prisma } from "../../../config/database.js";
import { LevelUnitKerja } from "@prisma/client";
import { NotFoundError, InternalServerError, ConflictError } from "../../../types/errors.js";
import { ForeignKeyHelper } from "../../../utils/ForeignKeyHelper.js";

export class UnitKerjaService {
  // Get hierarki lengkap unit kerja dengan children
  async getHierarkiUnitKerja() {
    try {
      const unitKerja = await prisma.unitKerja.findMany({
        where: { level: LevelUnitKerja.UNIVERSITAS },
        include: {
          children: {
            where: { level: LevelUnitKerja.FAKULTAS },
            include: {
              children: {
                where: { level: LevelUnitKerja.PROGRAM_STUDI },
                orderBy: { nama: "asc" },
              },
              fakultas: {
                select: {
                  id: true,
                  kode: true,
                  nama: true,
                  singkatan: true,
                },
              },
            },
            orderBy: { nama: "asc" },
          },
        },
        orderBy: { nama: "asc" },
      });

      return {
        message: "Hierarki unit kerja berhasil diambil",
        data: unitKerja,
      };
    } catch (error) {
      console.error("Error in getHierarkiUnitKerja:", error);
      throw new InternalServerError("Gagal mengambil hierarki unit kerja");
    }
  }

  // Get all unit kerja (flat list) dengan info parent
  async getAllUnitKerja() {
    try {
      const unitKerja = await prisma.unitKerja.findMany({
        include: {
          parent: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
          },
          children: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
            orderBy: { nama: "asc" },
          },
          fakultas: {
            select: {
              id: true,
              kode: true,
              nama: true,
              singkatan: true,
            },
          },
          programStudi: {
            select: {
              id: true,
              kode: true,
              nama: true,
              singkatan: true,
              jenjang: true,
            },
          },
        },
        orderBy: [{ level: "asc" }, { nama: "asc" }],
      });

      return {
        message: "Data unit kerja berhasil diambil",
        data: unitKerja,
      };
    } catch (error) {
      console.error("Error in getAllUnitKerja:", error);
      throw new InternalServerError("Gagal mengambil data unit kerja");
    }
  }

  // Get unit kerja by ID dengan hierarki path
  async getUnitKerjaById(id: number) {
    try {
      const unitKerja = await prisma.unitKerja.findUnique({
        where: { id },
        include: {
          parent: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
          },
          children: {
            include: {
              children: {
                orderBy: { nama: "asc" },
              },
            },
            orderBy: { nama: "asc" },
          },
          fakultas: {
            include: {
              programStudi: {
                select: {
                  id: true,
                  kode: true,
                  nama: true,
                  jenjang: true,
                },
              },
            },
          },
          programStudi: {
            include: {
              fakultas: {
                select: {
                  id: true,
                  kode: true,
                  nama: true,
                  singkatan: true,
                },
              },
            },
          },
        },
      });

      if (!unitKerja) {
        throw new NotFoundError("Unit kerja tidak ditemukan");
      }

      // Get breadcrumb path
      const path = await this.getUnitKerjaPath(id);

      return {
        message: "Data unit kerja berhasil diambil",
        data: {
          ...unitKerja,
          path: path.data,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in getUnitKerjaById:", error);
      throw new InternalServerError("Gagal mengambil data unit kerja");
    }
  }

  // Get unit kerja by level
  async getUnitKerjaByLevel(level: LevelUnitKerja) {
    try {
      const unitKerja = await prisma.unitKerja.findMany({
        where: { level },
        include: {
          parent: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
          },
          children: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
            orderBy: { nama: "asc" },
          },
        },
        orderBy: { nama: "asc" },
      });

      return {
        message: `Data unit kerja level ${level} berhasil diambil`,
        data: unitKerja,
      };
    } catch (error) {
      console.error("Error in getUnitKerjaByLevel:", error);
      throw new InternalServerError("Gagal mengambil data unit kerja");
    }
  }

  // Create unit kerja
  async createUnitKerja(data: { kode: string; nama: string; singkatan?: string; level: LevelUnitKerja; parentId?: number }) {
    try {
      // Check if kode already exists
      const existingKode = await prisma.unitKerja.findUnique({
        where: { kode: data.kode },
      });

      if (existingKode) {
        throw new ConflictError("Kode unit kerja sudah ada");
      }

      // Validate parent if parentId is provided
      if (data.parentId) {
        const parent = await prisma.unitKerja.findUnique({
          where: { id: data.parentId },
        });

        if (!parent) {
          throw new NotFoundError("Parent unit kerja tidak ditemukan");
        }

        // Validate hierarchy level
        if (data.level === LevelUnitKerja.UNIVERSITAS) {
          throw new ConflictError("Unit kerja level UNIVERSITAS tidak boleh memiliki parent");
        }

        if (data.level === LevelUnitKerja.FAKULTAS && parent.level !== LevelUnitKerja.UNIVERSITAS) {
          throw new ConflictError("Fakultas hanya bisa menjadi child dari Universitas");
        }

        if (data.level === LevelUnitKerja.PROGRAM_STUDI && parent.level !== LevelUnitKerja.FAKULTAS) {
          throw new ConflictError("Program Studi hanya bisa menjadi child dari Fakultas");
        }
      } else if (data.level !== LevelUnitKerja.UNIVERSITAS) {
        throw new ConflictError("Hanya unit kerja level UNIVERSITAS yang boleh tidak memiliki parent");
      }

      const unitKerja = await prisma.unitKerja.create({
        data,
        include: {
          parent: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
          },
        },
      });

      return {
        message: "Unit kerja berhasil dibuat",
        data: unitKerja,
      };
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in createUnitKerja:", error);
      throw new InternalServerError("Gagal membuat unit kerja");
    }
  }

  // Update unit kerja
  async updateUnitKerja(
    id: number,
    data: {
      kode?: string;
      nama?: string;
      singkatan?: string;
      level?: LevelUnitKerja;
      parentId?: number;
    }
  ) {
    try {
      // Check if unit kerja exists
      const existing = await prisma.unitKerja.findUnique({
        where: { id },
        include: { children: true },
      });

      if (!existing) {
        throw new NotFoundError("Unit kerja tidak ditemukan");
      }

      // Check if kode already exists (excluding current record)
      if (data.kode && data.kode !== existing.kode) {
        const existingKode = await prisma.unitKerja.findUnique({
          where: { kode: data.kode },
        });

        if (existingKode) {
          throw new ConflictError("Kode unit kerja sudah ada");
        }
      }

      // Validate parent if parentId is provided
      if (data.parentId !== undefined) {
        if (data.parentId === id) {
          throw new ConflictError("Unit kerja tidak bisa menjadi parent dari dirinya sendiri");
        }

        if (data.parentId) {
          const parent = await prisma.unitKerja.findUnique({
            where: { id: data.parentId },
          });

          if (!parent) {
            throw new NotFoundError("Parent unit kerja tidak ditemukan");
          }

          // Check if new parent is a descendant of current unit
          const isDescendant = await this.isDescendant(id, data.parentId);
          if (isDescendant) {
            throw new ConflictError("Tidak bisa menjadikan descendant sebagai parent");
          }
        }
      }

      const unitKerja = await prisma.unitKerja.update({
        where: { id },
        data,
        include: {
          parent: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
          },
          children: {
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
            },
          },
        },
      });

      return {
        message: "Unit kerja berhasil diperbarui",
        data: unitKerja,
      };
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in updateUnitKerja:", error);
      throw new InternalServerError("Gagal memperbarui unit kerja");
    }
  }

  // Delete unit kerja
  async deleteUnitKerja(id: number) {
    try {
      const existing = await prisma.unitKerja.findUnique({
        where: { id },
        include: {
          children: true,
          fakultas: true,
          programStudi: true,
        },
      });

      if (!existing) {
        throw new NotFoundError("Unit kerja tidak ditemukan");
      }

      // Manual validation for business logic constraints
      if (existing.children.length > 0) {
        throw new ConflictError("Tidak bisa menghapus unit kerja yang memiliki children");
      }

      if (existing.fakultas.length > 0 || existing.programStudi.length > 0) {
        throw new ConflictError("Tidak bisa menghapus unit kerja yang masih memiliki fakultas atau program studi");
      }

      // Use ForeignKeyHelper to handle delete with automatic foreign key checking
      const result = await ForeignKeyHelper.handleDelete(async () => {
        await prisma.unitKerja.delete({
          where: { id },
        });

        return {
          message: "Unit kerja berhasil dihapus",
          deletedRecord: {
            id: existing.id,
            kode: existing.kode,
            nama: existing.nama,
            level: existing.level,
          },
        };
      }, "Unit Kerja");

      return result;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in deleteUnitKerja:", error);
      throw new InternalServerError("Gagal menghapus unit kerja");
    }
  }

  // Get path hierarki unit kerja (breadcrumb)
  async getUnitKerjaPath(unitKerjaId: number) {
    try {
      const path = [];
      let currentUnit = await prisma.unitKerja.findUnique({
        where: { id: unitKerjaId },
        select: {
          id: true,
          kode: true,
          nama: true,
          level: true,
          parentId: true,
        },
      });

      while (currentUnit) {
        path.unshift(currentUnit);

        if (currentUnit.parentId) {
          currentUnit = await prisma.unitKerja.findUnique({
            where: { id: currentUnit.parentId },
            select: {
              id: true,
              kode: true,
              nama: true,
              level: true,
              parentId: true,
            },
          });
        } else {
          break;
        }
      }

      return {
        message: "Path unit kerja berhasil diambil",
        data: path,
      };
    } catch (error) {
      console.error("Error in getUnitKerjaPath:", error);
      throw new InternalServerError("Gagal mengambil path unit kerja");
    }
  }

  // Helper method to check if unitId is descendant of parentId
  private async isDescendant(unitId: number, potentialAncestorId: number): Promise<boolean> {
    const children = await prisma.unitKerja.findMany({
      where: { parentId: unitId },
      select: { id: true },
    });

    for (const child of children) {
      if (child.id === potentialAncestorId) {
        return true;
      }
      if (await this.isDescendant(child.id, potentialAncestorId)) {
        return true;
      }
    }

    return false;
  }
}
