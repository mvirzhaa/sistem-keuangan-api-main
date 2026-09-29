import { prisma } from "../../../config/database.js";
import { ChannelPembayaranSiakad, MetodePembayaranSiakad } from "@prisma/client";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";

export class ChannelPembayaranSiakadService {
  async getChannels(params: { page?: number; limit?: number; searchBy?: string; searchValue?: string }) {
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
          searchConditions.push({ kode: { contains: searchValue, mode: "insensitive" } }, { namaChannelPembayaranSiakad: { contains: searchValue, mode: "insensitive" } }, { logo: { contains: searchValue, mode: "insensitive" } });
        } else {
          // Search by specific field
          switch (searchBy) {
            case "kode":
              searchConditions.push({
                kode: { contains: searchValue, mode: "insensitive" },
              });
              break;
            case "namaChannelPembayaranSiakad":
              searchConditions.push({
                namaChannelPembayaranSiakad: { contains: searchValue, mode: "insensitive" },
              });
              break;
            case "logo":
              searchConditions.push({
                logo: { contains: searchValue, mode: "insensitive" },
              });
              break;
            case "aktif":
              const isAktifValue = searchValue.toLowerCase() === "true" || searchValue === "1" || searchValue.toLowerCase() === "aktif";
              searchConditions.push({ aktif: isAktifValue });
              break;
          }
        }

        if (searchConditions.length > 0) {
          whereClause.OR = searchConditions;
        }
      }

      // Get data with pagination
      const [data, total] = await Promise.all([
        prisma.channelPembayaranSiakad.findMany({
          where: whereClause,
          orderBy: {
            namaChannelPembayaran: "asc",
          },
          skip,
          take,
        }),
        prisma.channelPembayaranSiakad.count({
          where: whereClause,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        message: "Data channel pembayaran berhasil diambil",
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
      console.error("Error in getChannels:", error);
      throw new InternalServerError("Gagal mengambil data channel pembayaran");
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
          name: "namaChannelPembayaranSiakad",
          label: "Nama Channel Pembayaran Siakad",
        },
        {
          name: "logo",
          label: "Logo",
        },
        {
          name: "aktif",
          label: "Aktif",
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

  async addChannel(data: ChannelPembayaranSiakad) {
    try {
      const newChannel = await prisma.channelPembayaranSiakad.create({
        data,
      });

      return {
        message: "Channel pembayaran berhasil ditambahkan",
        data: newChannel,
      };
    } catch (error) {
      console.error("Error in addChannel:", error);
      throw new InternalServerError("Gagal menambahkan channel pembayaran");
    }
  }

  async updateChannel(id: number, data: Partial<ChannelPembayaranSiakad>) {
    try {
      const updatedChannel = await prisma.channelPembayaranSiakad.update({
        where: { id },
        data,
      });

      return {
        message: "Channel pembayaran berhasil diperbarui",
        data: updatedChannel,
      };
    } catch (error) {
      console.error("Error in updateChannel:", error);
      throw new InternalServerError("Gagal memperbarui channel pembayaran");
    }
  }

  async deleteChannel(id: number) {
    try {
      await prisma.channelPembayaranSiakad.delete({
        where: { id },
      });

      return {
        message: "Channel pembayaran berhasil dihapus",
      };
    } catch (error) {
      console.error("Error in deleteChannel:", error);
      throw new InternalServerError("Gagal menghapus channel pembayaran");
    }
  }
}

export class MetodePembayaranSiakadService {
  async getMetodePembayaran() {
    try {
      const metodePembayaran = await prisma.metodePembayaranSiakad.findMany({
        orderBy: {
          kode: "asc",
        },
        include: {
          metodePembayaranChannels: true,
        },
      });

      return {
        message: "Data metode pembayaran berhasil diambil",
        data: metodePembayaran,
      };
    } catch (error) {
      console.error("Error in getMetodePembayaran:", error);
      throw new InternalServerError("Gagal mengambil data metode pembayaran");
    }
  }

  async updateMetodePembayaran(id: number, data: Partial<MetodePembayaranSiakad>) {
    try {
      // Check if record exists
      const existingMetode = await prisma.metodePembayaranSiakad.findUnique({
        where: { id },
      });

      if (!existingMetode) {
        throw new NotFoundError("Metode pembayaran tidak ditemukan");
      }

      // Check if method is editable
      if (!existingMetode.isEditable) {
        throw new BadRequestError("Metode pembayaran ini tidak dapat diubah");
      }

      // Validate kode uniqueness if kode is being updated
      if (data.kode && data.kode !== existingMetode.kode) {
        const existingKode = await prisma.metodePembayaranSiakad.findFirst({
          where: {
            kode: data.kode,
            id: { not: id },
          },
        });

        if (existingKode) {
          throw new ConflictError("Kode metode pembayaran sudah digunakan");
        }
      }

      // Update the record
      const updatedMetode = await prisma.metodePembayaranSiakad.update({
        where: { id },
        data: {
          ...(data.kode && { kode: data.kode }),
          ...(data.namaMetodePembayaran && { namaMetodePembayaran: data.namaMetodePembayaran }),
          ...(data.jenis && { jenis: data.jenis }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
          ...(data.isAbleToAddChannel !== undefined && { isAbleToAddChannel: data.isAbleToAddChannel }),
        },
        include: {
          metodePembayaranChannels: true,
        },
      });

      return {
        message: "Metode pembayaran berhasil diperbarui",
        data: updatedMetode,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ConflictError) {
        throw error;
      }
      console.error("Error in updateMetodePembayaran:", error);
      throw new InternalServerError("Gagal memperbarui metode pembayaran");
    }
  }

  async deleteMetodePembayaran(id: number) {
    // Check if record exists
    const existingMetode = await prisma.metodePembayaranSiakad.findUnique({
      where: { id },
      include: {
        metodePembayaranChannels: true,
      },
    });

    if (!existingMetode) {
      throw new NotFoundError("Metode pembayaran tidak ditemukan");
    }

    // Check if method is deleteable
    if (!existingMetode.isDeleteable) {
      throw new BadRequestError("Metode pembayaran ini tidak dapat dihapus");
    }

    // Check if there are any associated channels
    if (existingMetode.metodePembayaranChannels.length > 0) {
      throw new BadRequestError(`Metode pembayaran tidak dapat dihapus karena masih memiliki ${existingMetode.metodePembayaranChannels.length} channel pembayaran yang terkait`);
    }

    try {
      const deletedRecord = await prisma.metodePembayaranSiakad.delete({
        where: { id },
        select: {
          id: true,
          kode: true,
          namaMetodePembayaran: true,
          jenis: true,
        },
      });

      return {
        message: "Metode pembayaran berhasil dihapus",
        deletedRecord,
      };
    } catch (error) {
      console.error("Error in deleteMetodePembayaran:", error);
      throw new InternalServerError("Gagal menghapus metode pembayaran");
    }
  }

  async addChannelToMetodePembayaran(metodeId: number, channelId: number) {
    // Check if metode pembayaran exists
    const existingMetode = await prisma.metodePembayaranSiakad.findUnique({
      where: { id: metodeId },
    });

    if (!existingMetode) {
      throw new NotFoundError("Metode pembayaran tidak ditemukan");
    }

    // Check if metode pembayaran can add channels
    if (!existingMetode.isAbleToAddChannel) {
      throw new BadRequestError("Metode pembayaran ini tidak dapat menambahkan channel");
    }

    // Check if channel exists
    const existingChannel = await prisma.channelPembayaranSiakad.findUnique({
      where: { id: channelId },
    });

    if (!existingChannel) {
      throw new NotFoundError("Channel pembayaran tidak ditemukan");
    }

    // Check if relation already exists
    const existingRelation = await prisma.metodePembayaranChannel.findUnique({
      where: {
        metodePembayaranSiakadId_channelPembayaranSiakadId: {
          metodePembayaranSiakadId: metodeId,
          channelPembayaranSiakadId: channelId,
        },
      },
    });

    if (existingRelation) {
      throw new ConflictError("Channel sudah terkait dengan metode pembayaran ini");
    }

    try {
      // Create the many-to-many relationship
      const newRelation = await prisma.metodePembayaranChannel.create({
        data: {
          metodePembayaranSiakadId: metodeId,
          channelPembayaranSiakadId: channelId,
          isAktif: true,
        },
        include: {
          metodePembayaranSiakad: true,
          channelPembayaranSiakad: true,
        },
      });

      // Get updated metode with all channels
      const updatedMetode = await prisma.metodePembayaranSiakad.findUnique({
        where: { id: metodeId },
        include: {
          metodePembayaranChannels: {
            include: {
              channelPembayaranSiakad: true,
            },
            where: {
              isAktif: true,
            },
          },
        },
      });

      return {
        message: "Channel berhasil ditambahkan ke metode pembayaran",
        data: {
          metode: updatedMetode,
          newRelation: newRelation,
        },
      };
    } catch (error) {
      console.error("Error in addChannelToMetodePembayaran:", error);
      throw new InternalServerError("Gagal menambahkan channel ke metode pembayaran");
    }
  }

  async removeChannelFromMetodePembayaran(metodeId: number, channelId: number) {
    // Check if relation exists
    const existingRelation = await prisma.metodePembayaranChannel.findUnique({
      where: {
        metodePembayaranSiakadId_channelPembayaranSiakadId: {
          metodePembayaranSiakadId: metodeId,
          channelPembayaranSiakadId: channelId,
        },
      },
      include: {
        metodePembayaranSiakad: true,
        channelPembayaranSiakad: true,
      },
    });

    if (!existingRelation) {
      throw new NotFoundError("Relasi metode pembayaran dan channel tidak ditemukan");
    }

    try {
      // Delete the relationship
      await prisma.metodePembayaranChannel.delete({
        where: {
          metodePembayaranSiakadId_channelPembayaranSiakadId: {
            metodePembayaranSiakadId: metodeId,
            channelPembayaranSiakadId: channelId,
          },
        },
      });

      return {
        message: "Channel berhasil dihapus dari metode pembayaran",
        removedRelation: {
          metode: existingRelation.metodePembayaranSiakad,
          channel: existingRelation.channelPembayaranSiakad,
        },
      };
    } catch (error) {
      console.error("Error in removeChannelFromMetodePembayaran:", error);
      throw new InternalServerError("Gagal menghapus channel dari metode pembayaran");
    }
  }
}
