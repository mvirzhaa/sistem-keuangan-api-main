import { body, param } from "express-validator";
import { prisma } from "../../../config/database.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../../types/errors.js";

export const createChannelPembayaranValidation = [
  body("kode")
    .notEmpty()
    .withMessage("Kode channel pembayaran wajib diisi")
    .isLength({ min: 1, max: 10 })
    .withMessage("Kode channel pembayaran maksimal 10 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode channel pembayaran hanya boleh mengandung huruf dan angka")
    .custom(async (value) => {
      const existing = await prisma.channelPembayaranSiakad.findUnique({
        where: { kode: value },
      });
      if (existing) {
        throw new ConflictError("Kode channel pembayaran sudah digunakan");
      }
      return true;
    }),

  body("namaChannelPembayaran").notEmpty().withMessage("Nama channel pembayaran wajib diisi").isLength({ min: 2, max: 100 }).withMessage("Nama channel pembayaran harus antara 2-100 karakter").trim(),

  body("logo").optional().isString().withMessage("Logo harus berupa string").isLength({ max: 255 }).withMessage("Logo maksimal 255 karakter"),

  body("isAktif").optional().isBoolean().withMessage("isAktif harus berupa boolean"),
];

export const updateChannelPembayaranValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.channelPembayaranSiakad.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Channel pembayaran tidak ditemukan");
      }
      return true;
    }),

  body("kode")
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage("Kode channel pembayaran maksimal 10 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode channel pembayaran hanya boleh mengandung huruf dan angka")
    .custom(async (value, { req }) => {
      if (value) {
        const existing = await prisma.channelPembayaranSiakad.findFirst({
          where: {
            kode: value,
            id: { not: parseInt(req.params?.id) },
          },
        });
        if (existing) {
          throw new ConflictError("Kode channel pembayaran sudah digunakan");
        }
      }
      return true;
    }),

  body("namaChannelPembayaran").optional().isLength({ min: 2, max: 100 }).withMessage("Nama channel pembayaran harus antara 2-100 karakter").trim(),

  body("logo").optional().isString().withMessage("Logo harus berupa string").isLength({ max: 255 }).withMessage("Logo maksimal 255 karakter"),

  body("isAktif").optional().isBoolean().withMessage("isAktif harus berupa boolean"),

  body().custom((value) => {
    const allowedFields = ["kode", "namaChannelPembayaran", "logo", "isAktif"];
    const providedFields = Object.keys(value);
    const hasValidField = providedFields.some((field) => allowedFields.includes(field));

    if (!hasValidField) {
      throw new BadRequestError("Minimal satu field harus diisi untuk update");
    }
    return true;
  }),
];

export const deleteChannelPembayaranValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.channelPembayaranSiakad.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Channel pembayaran tidak ditemukan");
      }
      return true;
    }),
];

export const updateMetodePembayaranValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.metodePembayaranSiakad.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Metode pembayaran tidak ditemukan");
      }
      return true;
    }),

  body("kode")
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage("Kode metode pembayaran maksimal 10 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode metode pembayaran hanya boleh mengandung huruf dan angka")
    .custom(async (value, { req }) => {
      if (value) {
        const existing = await prisma.metodePembayaranSiakad.findFirst({
          where: {
            kode: value,
            id: { not: parseInt(req.params?.id) },
          },
        });
        if (existing) {
          throw new ConflictError("Kode metode pembayaran sudah digunakan");
        }
      }
      return true;
    }),

  body("namaMetodePembayaran").optional().isLength({ min: 2, max: 100 }).withMessage("Nama metode pembayaran harus antara 2-100 karakter").trim(),

  body("jenis").optional().isIn(["OFFLINE", "ONLINE", "H2H", "DEPOSIT"]).withMessage("Jenis harus salah satu dari: OFFLINE, ONLINE, H2H, DEPOSIT"),

  body("isDefault").optional().isBoolean().withMessage("isDefault harus berupa boolean"),

  body("isAbleToAddChannel").optional().isBoolean().withMessage("isAbleToAddChannel harus berupa boolean"),

  body().custom((value) => {
    const allowedFields = ["kode", "namaMetodePembayaran", "jenis", "isDefault", "isAbleToAddChannel"];
    const providedFields = Object.keys(value);
    const hasValidField = providedFields.some((field) => allowedFields.includes(field));

    if (!hasValidField) {
      throw new BadRequestError("Minimal satu field harus diisi untuk update");
    }
    return true;
  }),
];

export const deleteMetodePembayaranValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.metodePembayaranSiakad.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Metode pembayaran tidak ditemukan");
      }
      return true;
    }),
];

export const removeChannelFromMetodeValidation = [
  param("metodeId").isInt({ min: 1 }).withMessage("ID metode pembayaran harus berupa angka positif"),
  body("channelId").isInt({ min: 1 }).withMessage("ID channel pembayaran harus berupa angka positif"),
];

export const addChannelToMetodeValidation = [
  param("metodeId").isInt({ min: 1 }).withMessage("ID metode pembayaran harus berupa angka positif"),
  body("channelId").isInt({ min: 1 }).withMessage("ID channel pembayaran harus berupa angka positif"),
];
