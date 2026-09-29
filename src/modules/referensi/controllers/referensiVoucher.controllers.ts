import { Request, Response } from "express";
import { AturanVoucherService, VoucherService } from "../services/referensiVoucher.services.js";
import { InternalServerError, ConflictError, NotFoundError, BadRequestError } from "../../../types/errors.js";

const voucherService = new VoucherService();
const aturanVoucherService = new AturanVoucherService();

export const getVoucherSearchFields = async (req: Request, res: Response) => {
  try {
    const result = await voucherService.getSearchFields();

    res.json(result);
  } catch (error) {
    console.error("Error in getVoucherSearchFields:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil search fields voucher",
    });
  }
};

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, searchBy = "all", searchValue = "" } = req.query;

    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      searchBy: searchBy as string,
      searchValue: searchValue as string,
    };

    const result = await voucherService.getAllVouchers(params);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllVouchers:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data voucher",
    });
  }
};

export const addVoucher = async (req: Request, res: Response) => {
  try {
    const { nama, kode, generateKodeOtomatis, nominal, periodeAwalId, periodeAkhirId, tanggalExpired, anggaran, realisasi } = req.body;

    // Convert date string to Date object if provided
    let parsedTanggalExpired: Date | undefined = undefined;
    if (tanggalExpired) {
      const tempDate = new Date(tanggalExpired);
      if (isNaN(tempDate.getTime())) {
        return res.status(400).json({
          message: "Format tanggal expired tidak valid",
        });
      }
      parsedTanggalExpired = tempDate;
    }

    const voucherData = {
      nama,
      kode: kode || undefined,
      generateKodeOtomatis: generateKodeOtomatis || false,
      nominal: parseInt(nominal),
      periodeAwalId: periodeAwalId ? parseInt(periodeAwalId) : undefined,
      periodeAkhirId: periodeAkhirId ? parseInt(periodeAkhirId) : undefined,
      tanggalExpired: parsedTanggalExpired,
      anggaran: parseInt(anggaran),
      realisasi: realisasi ? parseInt(realisasi) : undefined,
    };

    const result = await voucherService.addVoucher(voucherData);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addVoucher:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan voucher",
    });
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, kode, generateKodeOtomatis, nominal, periodeAwalId, periodeAkhirId, tanggalExpired, anggaran, realisasi } = req.body;

    // Convert date string to Date object if provided
    let parsedTanggalExpired: Date | null | undefined = undefined;
    if (tanggalExpired !== undefined) {
      if (tanggalExpired === null) {
        parsedTanggalExpired = null;
      } else {
        const tempDate = new Date(tanggalExpired);
        if (isNaN(tempDate.getTime())) {
          return res.status(400).json({
            message: "Format tanggal expired tidak valid",
          });
        }
        parsedTanggalExpired = tempDate;
      }
    }

    const updateData: any = {};

    if (nama !== undefined) updateData.nama = nama;
    if (kode !== undefined) updateData.kode = kode;
    if (generateKodeOtomatis !== undefined) updateData.generateKodeOtomatis = generateKodeOtomatis;
    if (nominal !== undefined) updateData.nominal = parseInt(nominal);
    if (periodeAwalId !== undefined) updateData.periodeAwalId = periodeAwalId ? parseInt(periodeAwalId) : null;
    if (periodeAkhirId !== undefined) updateData.periodeAkhirId = periodeAkhirId ? parseInt(periodeAkhirId) : null;
    if (tanggalExpired !== undefined) updateData.tanggalExpired = parsedTanggalExpired;
    if (anggaran !== undefined) updateData.anggaran = parseInt(anggaran);
    if (realisasi !== undefined) updateData.realisasi = realisasi ? parseInt(realisasi) : null;

    const result = await voucherService.updateVoucher(id!, updateData);

    res.json(result);
  } catch (error) {
    console.error("Error in updateVoucher:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui voucher",
    });
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await voucherService.deleteVoucher(id!);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteVoucher:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus voucher",
    });
  }
};

export const deleteBulkVouchers = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    const result = await voucherService.deleteVouchersBulk(ids);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteBulkVouchers:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError || error instanceof BadRequestError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus voucher secara bulk",
    });
  }
};

export const addAturanVoucher = async (req: Request, res: Response) => {
  try {
    const { voucherId } = req.params;
    const { jenisTagihanId, maksimalNominal } = req.body;

    const aturanData = {
      jenisTagihanId,
      maksimalNominal: parseInt(maksimalNominal),
    };

    const result = await aturanVoucherService.addAturanVoucher(voucherId!, aturanData);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addAturanVoucher:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan aturan voucher",
    });
  }
};

export const getAllAturanVoucher = async (req: Request, res: Response) => {
  try {
    const { voucherId } = req.params;

    const result = await aturanVoucherService.getAllAturanVoucher(voucherId!);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllAturanVoucher:", error);

    if (error instanceof InternalServerError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data aturan voucher",
    });
  }
};

export const updateAturanVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { jenisTagihanId, maksimalNominal } = req.body;

    const updateData: any = {};

    if (jenisTagihanId !== undefined) updateData.jenisTagihanId = jenisTagihanId;
    if (maksimalNominal !== undefined) updateData.maksimalNominal = parseInt(maksimalNominal);

    const result = await aturanVoucherService.updateAturanVoucher(id!, updateData);

    res.json(result);
  } catch (error) {
    console.error("Error in updateAturanVoucher:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui aturan voucher",
    });
  }
};

export const deleteAturanVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await aturanVoucherService.deleteAturanVoucher(id!);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteAturanVoucher:", error);

    if (error instanceof InternalServerError || error instanceof ConflictError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus aturan voucher",
    });
  }
};
