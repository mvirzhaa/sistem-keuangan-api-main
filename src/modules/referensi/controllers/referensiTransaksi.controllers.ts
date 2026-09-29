import { Request, Response } from "express";
import { FrekuensiService, JenisTagihanService, JenisTransaksiService, KelompokService } from "../services/referensiTransaksi.services.js";
import { NotFoundError, ConflictError, BadRequestError, InternalServerError } from "../../../types/errors.js";

const jenisTransaksiService = new JenisTransaksiService();
const kelompokService = new KelompokService();
const frekuensiService = new FrekuensiService();
const jenisTagihanService = new JenisTagihanService();

// Jenis Transaksi
export const getAllJenisTransaksi = async (_: Request, res: Response) => {
  try {
    const result = await jenisTransaksiService.getAll();

    res.json({
      message: "Data jenis transaksi berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllJenisTransaksi:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data jenis transaksi",
    });
  }
};

export const getAllKelompok = async (req: Request, res: Response) => {
  const jenisTransaksiId = req.query.jenisTransaksiId ? parseInt(req.query.jenisTransaksiId as string) : undefined;
  try {
    const result = await kelompokService.getAll(jenisTransaksiId);

    res.json({
      message: "Data kelompok berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllKelompok:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data kelompok",
    });
  }
};

export const addKelompok = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await kelompokService.addKelompok(data);

    res.json({
      message: "Kelompok berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    console.error("Error in addKelompok:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan kelompok",
    });
  }
};

export const updateKelompok = async (req: Request, res: Response) => {
  const id = req.params.id!;
  const data = req.body;

  try {
    const result = await kelompokService.updateKelompok(parseInt(id), data);

    res.json({
      message: "Kelompok berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateKelompok:", error);

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
      message: "Terjadi kesalahan saat memperbarui kelompok",
    });
  }
};

export const deleteKelompok = async (req: Request, res: Response) => {
  try {
    const id = req.params.id!;
    await kelompokService.deleteKelompok(parseInt(id));

    res.json({
      message: "Kelompok berhasil dihapus",
    });
  } catch (error) {
    console.error("Error in deleteKelompok:", error);

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
      message: "Terjadi kesalahan saat menghapus kelompok",
    });
  }
};

export const getAllFrekuensi = async (_: Request, res: Response) => {
  try {
    const result = await frekuensiService.getAll();

    res.json({
      message: "Data frekuensi berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllFrekuensi:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data frekuensi",
    });
  }
};

export const getJenisTagihanSearchField = async (req: Request, res: Response) => {
  try {
    const result = await jenisTagihanService.getSearchFields();

    res.json(result);
  } catch (error) {
    console.error("Error in getJenisTagihanSearchFields:", error);

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

export const getAllJenisTagihan = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", searchBy = "all", searchValue = "", filterKelompok, filterFrekuensi } = req.query;

    const params = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      searchBy: searchBy as string,
      searchValue: searchValue as string,
      filterKelompok: filterKelompok ? parseInt(filterKelompok as string) : undefined,
      filterFrekuensi: filterFrekuensi ? parseInt(filterFrekuensi as string) : undefined,
    };

    const result = await jenisTagihanService.getAll(params);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllJenisTagihan:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data jenis tagihan",
    });
  }
};

export const addJenisTagihan = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await jenisTagihanService.addData(data);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addJenisTagihan:", error);

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
      message: "Terjadi kesalahan saat menambahkan jenis tagihan",
    });
  }
};

export const updateJenisTagihan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id!;
    const data = req.body;

    const result = await jenisTagihanService.updateData(id, data);

    res.json(result);
  } catch (error) {
    console.error("Error in updateJenisTagihan:", error);

    if (error instanceof NotFoundError) {
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
      message: "Terjadi kesalahan saat memperbarui jenis tagihan",
    });
  }
};

export const deleteJenisTagihan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id!;

    const result = await jenisTagihanService.deleteDataSingle(id);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteJenisTagihan:", error);

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
      message: "Terjadi kesalahan saat menghapus jenis tagihan",
    });
  }
};

export const deleteBulkJenisTagihan = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    const result = await jenisTagihanService.deleteDataBulk(ids);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteBulkJenisTagihan:", error);

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

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus jenis tagihan",
    });
  }
};

export const updateJenisBiayaBulk = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const result = await jenisTagihanService.updateJenisBiayaBulk(data);

    res.json(result);
  } catch (error) {
    console.error("Error in updateJenisBiayaBulk:", error);

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

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui jenis biaya secara bulk",
    });
  }
};
