import { Request, Response } from "express";
import { KelompokUKTService } from "../services/referensiTarif.services.js";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";

const kelompokUKTService = new KelompokUKTService();

export const getAllKelompokUKT = async (_: Request, res: Response) => {
  try {
    const result = await kelompokUKTService.getAllKelompokUKT();

    res.json({
      message: "Data kelompok UKT berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllKelompokUKT:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data kelompok UKT",
    });
  }
};

export const addKelompokUKT = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const result = await kelompokUKTService.addKelompokUKT(data);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addKelompokUKT:", error);

    if (error instanceof ConflictError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan kelompok UKT",
    });
  }
};

export const updateKelompokUKT = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const data = req.body;

    const result = await kelompokUKTService.updateKelompokUKT(id, data);

    res.json(result);
  } catch (error) {
    console.error("Error in updateKelompokUKT:", error);

    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error instanceof BadRequestError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error instanceof ConflictError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui kelompok UKT",
    });
  }
};

export const deleteKelompokUKT = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);

    const result = await kelompokUKTService.deleteKelompokUKT(id);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteKelompokUKT:", error);

    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus kelompok UKT",
    });
  }
};
