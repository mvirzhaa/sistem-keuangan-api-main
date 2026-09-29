import { Request, Response } from "express";
import { JalurPendaftaranService } from "../services/jalurPendaftaran.services.js";
import { ConflictError, InternalServerError, NotFoundError, BadRequestError } from "../../../types/errors.js";

const jalurPendaftaranService = new JalurPendaftaranService();

export const getAllJalurPendaftaran = async (_: Request, res: Response) => {
  try {
    const result = await jalurPendaftaranService.getAllJalurPendaftaran();
    res.json(result);
  } catch (error) {
    console.error("Error in getAllJalurPendaftaran:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data jalur pendaftaran",
    });
  }
};

export const getJalurPendaftaranById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await jalurPendaftaranService.getJalurPendaftaranById(parseInt(id!));
    res.json(result);
  } catch (error) {
    console.error("Error in getJalurPendaftaranById:", error);

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
      message: "Terjadi kesalahan saat mengambil data jalur pendaftaran",
    });
  }
};

export const createJalurPendaftaran = async (req: Request, res: Response) => {
  try {
    const { nama } = req.body;

    const result = await jalurPendaftaranService.createJalurPendaftaran({
      nama,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createJalurPendaftaran:", error);

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
      message: "Terjadi kesalahan saat membuat jalur pendaftaran",
    });
  }
};

export const updateJalurPendaftaran = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    const result = await jalurPendaftaranService.updateJalurPendaftaran(parseInt(id!), {
      nama,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in updateJalurPendaftaran:", error);

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
      message: "Terjadi kesalahan saat memperbarui jalur pendaftaran",
    });
  }
};

export const deleteJalurPendaftaran = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await jalurPendaftaranService.deleteJalurPendaftaran(parseInt(id!));
    res.json(result);
  } catch (error) {
    console.error("Error in deleteJalurPendaftaran:", error);

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
      message: "Terjadi kesalahan saat menghapus jalur pendaftaran",
    });
  }
};

export const deleteJalurPendaftaranBulk = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Validate request body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Field 'ids' harus berupa array yang tidak kosong",
      });
    }

    // Convert string IDs to numbers and validate
    const numericIds = ids.map((id) => {
      const numId = parseInt(id);
      if (isNaN(numId)) {
        throw new BadRequestError(`ID '${id}' tidak valid`);
      }
      return numId;
    });

    const result = await jalurPendaftaranService.deleteJalurPendaftaranBulk(numericIds);
    res.json(result);
  } catch (error) {
    console.error("Error in deleteJalurPendaftaranBulk:", error);

    if (error instanceof ConflictError || error instanceof NotFoundError || error instanceof BadRequestError) {
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
      message: "Terjadi kesalahan saat menghapus jalur pendaftaran",
    });
  }
};

export const validateDeleteJalurPendaftaran = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await jalurPendaftaranService.validateCanDeleteJalurPendaftaran(parseInt(id!));
    res.json(result);
  } catch (error) {
    console.error("Error in validateDeleteJalurPendaftaran:", error);

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
      message: "Terjadi kesalahan saat validasi penghapusan jalur pendaftaran",
    });
  }
};
