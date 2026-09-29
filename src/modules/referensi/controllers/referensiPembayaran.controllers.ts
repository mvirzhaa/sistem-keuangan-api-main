import { Request, Response } from "express";
import { ChannelPembayaranSiakadService, MetodePembayaranSiakadService } from "../services/referensiPembayaran.services.js";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../../types/errors.js";

const channelPembayaranService = new ChannelPembayaranSiakadService();
const metodePembayaranService = new MetodePembayaranSiakadService();

export const getChannelPembayaranSiakadSearchFields = async (_: Request, res: Response) => {
  try {
    const result = await channelPembayaranService.getSearchFields();

    res.json(result);
  } catch (error) {
    console.error("Error in getChannelSearchFields:", error);

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

export const getChannelPembayaranSiakad = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", searchBy = "all", searchValue = "" } = req.query;

    // Convert and validate query parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        message: "Page harus berupa angka positif",
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        message: "Limit harus berupa angka antara 1-100",
      });
    }

    const params = {
      page: pageNum,
      limit: limitNum,
      searchBy: searchBy as string,
      searchValue: searchValue as string,
    };

    const result = await channelPembayaranService.getChannels(params);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllChannels:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data channel pembayaran",
    });
  }
};

export const addChannelPembayaran = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const result = await channelPembayaranService.addChannel(data);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addChannelPembayaran:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan channel pembayaran",
    });
  }
};

export const updateChannelPembayaran = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const data = req.body;

    const result = await channelPembayaranService.updateChannel(id, data);

    res.json(result);
  } catch (error) {
    console.error("Error in updateChannelPembayaran:", error);

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
      message: "Terjadi kesalahan saat memperbarui channel pembayaran",
    });
  }
};

export const deleteChannelPembayaran = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);

    const result = await channelPembayaranService.deleteChannel(id);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteChannelPembayaran:", error);

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
      message: "Terjadi kesalahan saat menghapus channel pembayaran",
    });
  }
};

export const getMetodePembayaran = async (_: Request, res: Response) => {
  try {
    const result = await metodePembayaranService.getMetodePembayaran();

    res.json(result);
  } catch (error) {
    console.error("Error in getMetodePembayaran:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data metode pembayaran",
    });
  }
};

export const updateMetodePembayaran = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const data = req.body;

    const result = await metodePembayaranService.updateMetodePembayaran(id, data);

    res.json(result);
  } catch (error) {
    console.error("Error in updateMetodePembayaran:", error);

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
      message: "Terjadi kesalahan saat memperbarui metode pembayaran",
    });
  }
};

export const deleteMetodePembayaran = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);

    const result = await metodePembayaranService.deleteMetodePembayaran(id);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteMetodePembayaran:", error);

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
      message: "Terjadi kesalahan saat menghapus metode pembayaran",
    });
  }
};

export const addChannelToMetode = async (req: Request, res: Response) => {
  try {
    const metodeId = parseInt(req.params.metodeId!);
    const { channelId } = req.body;

    const result = await metodePembayaranService.addChannelToMetodePembayaran(metodeId, channelId);

    res.json(result);
  } catch (error) {
    console.error("Error in addChannelToMetode:", error);

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
      message: "Terjadi kesalahan saat menambahkan channel ke metode pembayaran",
    });
  }
};

export const removeChannelFromMetode = async (req: Request, res: Response) => {
  try {
    const metodeId = parseInt(req.params.metodeId!);
    const { channelId } = req.body;

    const result = await metodePembayaranService.removeChannelFromMetodePembayaran(metodeId, channelId);

    res.json(result);
  } catch (error) {
    console.error("Error in removeChannelFromMetode:", error);

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
      message: "Terjadi kesalahan saat menghapus channel dari metode pembayaran",
    });
  }
};
