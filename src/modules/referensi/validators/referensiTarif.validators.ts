import { body, param } from "express-validator";
import { prisma } from "../../../config/database.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../../types/errors.js";

export const createKelompokUKTValidation = [
  body("kode")
    .notEmpty()
    .withMessage("Kode kelompok UKT wajib diisi")
    .isLength({ min: 1, max: 10 })
    .withMessage("Kode kelompok UKT maksimal 10 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode kelompok UKT hanya boleh mengandung huruf dan angka")
    .custom(async (value) => {
      const existing = await prisma.kelompokUKT.findUnique({
        where: { kode: value },
      });
      if (existing) {
        throw new ConflictError("Kode kelompok UKT sudah digunakan");
      }
      return true;
    }),

  body("nama").notEmpty().withMessage("Nama kelompok UKT wajib diisi").isLength({ min: 2, max: 100 }).withMessage("Nama kelompok UKT harus antara 2-100 karakter").trim(),

  body("isKipKuliah").optional().isBoolean().withMessage("isKipKuliah harus berupa boolean"),
];

export const updateKelompokUKTValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.kelompokUKT.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Kelompok UKT tidak ditemukan");
      }
      return true;
    }),

  body("kode")
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage("Kode kelompok UKT maksimal 10 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode kelompok UKT hanya boleh mengandung huruf dan angka")
    .custom(async (value, { req }) => {
      if (value) {
        const existing = await prisma.kelompokUKT.findFirst({
          where: {
            kode: value,
            id: { not: parseInt(req.params?.id) },
          },
        });
        if (existing) {
          throw new ConflictError("Kode kelompok UKT sudah digunakan");
        }
      }
      return true;
    }),

  body("nama").optional().isLength({ min: 2, max: 100 }).withMessage("Nama kelompok UKT harus antara 2-100 karakter").trim(),

  body("isKipKuliah").optional().isBoolean().withMessage("isKipKuliah harus berupa boolean"),

  body().custom((value) => {
    const allowedFields = ["kode", "nama", "isKipKuliah"];
    const providedFields = Object.keys(value);
    const hasValidField = providedFields.some((field) => allowedFields.includes(field));

    if (!hasValidField) {
      throw new BadRequestError("Minimal satu field harus diisi untuk update");
    }
    return true;
  }),
];

export const deleteKelompokUKTValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.kelompokUKT.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Kelompok UKT tidak ditemukan");
      }
      return true;
    }),
];
