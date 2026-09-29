import { Request, Response } from "express";
import { KegiatanAkademikService, RekananService } from "../services/referensiPelengkap.services.js";
import { ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";
import { Rekanan } from "@prisma/client";

const kegiatanAkademikService = new KegiatanAkademikService();
const rekananService = new RekananService();

export const getKegiatanAkademik = async (req: Request, res: Response) => {
  try {
    const result = await kegiatanAkademikService.getKegiatanAkademik();

    res.json({
      message: "Data kegiatan akademik berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Error in getKegiatanAkademik:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data kegiatan akademik",
    });
  }
};

export const getRekananSearchFields = async (req: Request, res: Response) => {
  try {
    const result = await rekananService.getSearchFields();

    res.json(result);
  } catch (error) {
    console.error("Error in getRekananSearchFields:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil search fields rekanan",
    });
  }
};

export const getRekanan = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, searchBy = "all", searchValue = "" } = req.query;

    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      searchBy: searchBy as string,
      searchValue: searchValue as string,
    };

    const result = await rekananService.getRekanan(params);

    res.json(result);
  } catch (error) {
    console.error("Error in getRekanan:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data rekanan",
    });
  }
};

export const addRekanan = async (req: Request, res: Response) => {
  try {
    const { nama, kota, telepon, email } = req.body;

    // Build data object with proper type
    const rekananData: Omit<Rekanan, "id" | "createdAt" | "updatedAt"> = {
      nama,
      kota: kota || null,
      telepon: telepon || null,
      email: email || null,
    };

    const result = await rekananService.addRekanan(rekananData);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addRekanan:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan rekanan",
    });
  }
};

export const deleteRekanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await rekananService.deleteRekanan(parseInt(id!));

    res.json(result);
  } catch (error) {
    console.error("Error in deleteRekanan:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus rekanan",
    });
  }
};

export const updateRekanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, kota, telepon, email } = req.body;

    // Build data object with proper type
    const updateData: Partial<Omit<Rekanan, "id" | "createdAt" | "updatedAt">> = {};

    // Only include fields that are provided
    if (nama !== undefined) updateData.nama = nama;
    if (kota !== undefined) updateData.kota = kota;
    if (telepon !== undefined) updateData.telepon = telepon;
    if (email !== undefined) updateData.email = email;

    const result = await rekananService.updateRekanan(parseInt(id!), updateData);

    res.json(result);
  } catch (error) {
    console.error("Error in updateRekanan:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui rekanan",
    });
  }
};
