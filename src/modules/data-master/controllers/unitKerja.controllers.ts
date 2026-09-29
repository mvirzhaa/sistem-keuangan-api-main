import { Request, Response } from "express";
import { UnitKerjaService } from "../services/unitKerja.services.js";
import { ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";
import { LevelUnitKerja } from "@prisma/client";

const unitKerjaService = new UnitKerjaService();

export const getHierarkiUnitKerja = async (_: Request, res: Response) => {
  try {
    const result = await unitKerjaService.getHierarkiUnitKerja();
    res.json(result);
  } catch (error) {
    console.error("Error in getHierarkiUnitKerja:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil hierarki unit kerja",
    });
  }
};

export const getAllUnitKerja = async (_: Request, res: Response) => {
  try {
    const result = await unitKerjaService.getAllUnitKerja();
    res.json(result);
  } catch (error) {
    console.error("Error in getAllUnitKerja:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data unit kerja",
    });
  }
};

export const getUnitKerjaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await unitKerjaService.getUnitKerjaById(parseInt(id!));
    res.json(result);
  } catch (error) {
    console.error("Error in getUnitKerjaById:", error);

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
      message: "Terjadi kesalahan saat mengambil data unit kerja",
    });
  }
};

export const getUnitKerjaByLevel = async (req: Request, res: Response) => {
  try {
    const { level } = req.query;
    const result = await unitKerjaService.getUnitKerjaByLevel(level as LevelUnitKerja);
    res.json(result);
  } catch (error) {
    console.error("Error in getUnitKerjaByLevel:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data unit kerja",
    });
  }
};

export const getUnitKerjaPath = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await unitKerjaService.getUnitKerjaPath(parseInt(id!));
    res.json(result);
  } catch (error) {
    console.error("Error in getUnitKerjaPath:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil path unit kerja",
    });
  }
};

export const createUnitKerja = async (req: Request, res: Response) => {
  try {
    const { kode, nama, singkatan, level, parentId } = req.body;

    const result = await unitKerjaService.createUnitKerja({
      kode,
      nama,
      singkatan,
      level,
      parentId: parseInt(parentId),
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createUnitKerja:", error);

    if (error instanceof ConflictError || error instanceof NotFoundError) {
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
      message: "Terjadi kesalahan saat membuat unit kerja",
    });
  }
};

export const updateUnitKerja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kode, nama, singkatan, level, parentId } = req.body;

    const result = await unitKerjaService.updateUnitKerja(parseInt(id!), {
      kode,
      nama,
      singkatan,
      level,
      parentId: parseInt(parentId),
    });

    res.json(result);
  } catch (error) {
    console.error("Error in updateUnitKerja:", error);

    if (error instanceof ConflictError || error instanceof NotFoundError) {
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
      message: "Terjadi kesalahan saat memperbarui unit kerja",
    });
  }
};

export const deleteUnitKerja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await unitKerjaService.deleteUnitKerja(parseInt(id!));
    res.json(result);
  } catch (error) {
    console.error("Error in deleteUnitKerja:", error);

    if (error instanceof ConflictError || error instanceof NotFoundError) {
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
      message: "Terjadi kesalahan saat menghapus unit kerja",
    });
  }
};
