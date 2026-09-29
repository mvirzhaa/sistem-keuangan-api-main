import { Request, Response } from "express";
import { AturanPotonganService, PotonganService } from "../services/referensiPotongan.services.js";
import { ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";
import { AturanPotongan, Potongan } from "@prisma/client";

const potonganService = new PotonganService();
const aturanPotonganService = new AturanPotonganService();

export const getAllPotongan = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, searchBy = "all", searchValue = "", filterJenisPotongan, filterJenisTagihan, filterRekanan, filterTipePotongan } = req.query;

    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      searchBy: searchBy as string,
      searchValue: searchValue as string,
      filterJenisPotongan: filterJenisPotongan as string,
      filterJenisTagihan: filterJenisTagihan as string,
      filterRekanan: filterRekanan ? parseInt(filterRekanan as string) : undefined,
      filterTipePotongan: filterTipePotongan as string,
    };

    const result = await potonganService.getAllPotongan(params);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllPotongan:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data potongan",
    });
  }
};

export const getPotonganById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await potonganService.getPotonganById(id!);

    res.json(result);
  } catch (error) {
    console.error("Error in getPotonganById:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data potongan",
    });
  }
};

export const getPotonganSearchFields = async (req: Request, res: Response) => {
  try {
    const result = await potonganService.getSearchFields();

    res.json(result);
  } catch (error) {
    console.error("Error in getPotonganSearchFields:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil search fields",
    });
  }
};

export const addPotongan = async (req: Request, res: Response) => {
  try {
    const { nama, periodeAwalId, periodeAkhirId, nominal, anggaran, jenisPotongan, rekananId, jumlahPenerima, realisasi, isMemotongTagihan, tipePotongan } = req.body;

    // Create data object with proper type
    const potonganData: Omit<Potongan, "id" | "createdAt" | "updatedAt"> = {
      nama,
      periodeAwalId: periodeAwalId ? parseInt(periodeAwalId) : null,
      periodeAkhirId: periodeAkhirId ? parseInt(periodeAkhirId) : null,
      nominal: parseInt(nominal),
      anggaran: parseInt(anggaran),
      jenisPotongan,
      rekananId: rekananId ? parseInt(rekananId) : null,
      jumlahPenerima: jumlahPenerima ? parseInt(jumlahPenerima) : null,
      realisasi: realisasi ? parseInt(realisasi) : null,
      isMemotongTagihan: isMemotongTagihan === true || isMemotongTagihan === "true",
      tipePotongan,
      //   jenisTagihanId: null, // Add if required by schema
    };

    const result = await potonganService.addPotongan(potonganData);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addPotongan:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan potongan",
    });
  }
};

export const deletePotongan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await potonganService.deletePotongan(id!);

    res.json(result);
  } catch (error) {
    console.error("Error in deletePotongan:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus potongan",
    });
  }
};

export const deletePotonganBulk = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    const result = await potonganService.deletePotonganBulk(ids);

    res.json(result);
  } catch (error) {
    console.error("Error in deletePotonganBulk:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus potongan",
    });
  }
};

export const updatePotongan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, periodeAwalId, periodeAkhirId, nominal, anggaran, jenisPotongan, rekananId, jumlahPenerima, realisasi, isMemotongTagihan, tipePotongan } = req.body;

    // Build update data object with proper type conversion
    const updateData: Partial<Omit<Potongan, "id" | "createdAt" | "updatedAt">> = {};

    if (nama !== undefined) updateData.nama = nama;
    if (periodeAwalId !== undefined) updateData.periodeAwalId = periodeAwalId ? parseInt(periodeAwalId) : null;
    if (periodeAkhirId !== undefined) updateData.periodeAkhirId = periodeAkhirId ? parseInt(periodeAkhirId) : null;
    if (nominal !== undefined) updateData.nominal = parseInt(nominal);
    if (anggaran !== undefined) updateData.anggaran = parseInt(anggaran);
    if (jenisPotongan !== undefined) updateData.jenisPotongan = jenisPotongan;
    if (rekananId !== undefined) updateData.rekananId = rekananId ? parseInt(rekananId) : null;
    if (jumlahPenerima !== undefined) updateData.jumlahPenerima = jumlahPenerima ? parseInt(jumlahPenerima) : null;
    if (realisasi !== undefined) updateData.realisasi = realisasi ? parseInt(realisasi) : null;
    if (isMemotongTagihan !== undefined) updateData.isMemotongTagihan = isMemotongTagihan === true || isMemotongTagihan === "true";
    if (tipePotongan !== undefined) updateData.tipePotongan = tipePotongan;

    const result = await potonganService.updatePotongan(id!, updateData);

    res.json(result);
  } catch (error) {
    console.error("Error in updatePotongan:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui potongan",
    });
  }
};

export const importPotonganFromExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File Excel wajib diupload",
      });
    }

    const result = await potonganService.importPotonganFromExcel(req.file.buffer);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in importPotonganFromExcel:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengimport data potongan",
    });
  }
};

export const downloadTemplateExcel = async (req: Request, res: Response) => {
  try {
    const result = await potonganService.downloadTemplateExcel();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);

    res.send(result.buffer);
  } catch (error) {
    console.error("Error in downloadTemplateExcel:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mendownload template Excel",
    });
  }
};

export const addAturanPotongan = async (req: Request, res: Response) => {
  try {
    const potonganId = req.params.potonganId!;
    const { jenisTagihanId, maksimalNominal, nomorUrut } = req.body;

    // Create data object with proper type
    const aturanData: Omit<AturanPotongan, "id" | "createdAt" | "updatedAt"> = {
      potonganId,
      jenisTagihanId,
      maksimalNominal: parseInt(maksimalNominal),
      nomorUrut: nomorUrut ? parseInt(nomorUrut) : 0, // Will be auto-generated if 0
    };

    const result = await aturanPotonganService.addAturanPotongan(potonganId, aturanData);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addAturanPotongan:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError || error instanceof ConflictError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan aturan potongan",
    });
  }
};

export const getAllAturanPotongan = async (req: Request, res: Response) => {
  try {
    const { potonganId } = req.params;

    const result = await aturanPotonganService.getAllAturanPotongan(potonganId!);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllAturanPotongan:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data aturan potongan",
    });
  }
};

// Add to existing controllers
export const updateAturanPotongan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { jenisTagihanId, maksimalNominal, nomorUrut } = req.body;

    // Build update data object with proper type conversion
    const updateData: Partial<Omit<AturanPotongan, "id" | "createdAt" | "updatedAt" | "potonganId">> = {};

    if (jenisTagihanId !== undefined) updateData.jenisTagihanId = jenisTagihanId;
    if (maksimalNominal !== undefined) updateData.maksimalNominal = parseInt(maksimalNominal);
    if (nomorUrut !== undefined) updateData.nomorUrut = parseInt(nomorUrut);

    const result = await aturanPotonganService.updateAturanPotongan(id!, updateData);

    res.json(result);
  } catch (error) {
    console.error("Error in updateAturanPotongan:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError || error instanceof ConflictError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui aturan potongan",
    });
  }
};

export const deleteAturanPotongan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await aturanPotonganService.deleteAturanPotongan(id!);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteAturanPotongan:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus aturan potongan",
    });
  }
};
