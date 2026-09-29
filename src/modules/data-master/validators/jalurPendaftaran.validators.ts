import { body, param } from "express-validator";
import { prisma } from "../../../config/database.js";
import { ConflictError, BadRequestError, NotFoundError } from "../../../types/errors.js";

export const createJalurPendaftaranValidation = [
  body("nama")
    .notEmpty()
    .withMessage("Nama wajib diisi")
    .isLength({ min: 3, max: 100 })
    .withMessage("Nama harus antara 3-100 karakter")
    .trim()
    .custom(async (value) => {
      const existing = await prisma.jalurPendaftaran.findFirst({
        where: {
          nama: {
            equals: value,
            mode: "insensitive",
          },
        },
      });
      if (existing) {
        throw new ConflictError("Nama jalur pendaftaran sudah ada");
      }
      return true;
    }),
];

export const updateJalurPendaftaranValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.jalurPendaftaran.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Jalur pendaftaran tidak ditemukan");
      }
      return true;
    }),

  body("nama")
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("Nama harus antara 3-100 karakter")
    .trim()
    .custom(async (value, { req }) => {
      if (value) {
        const id = parseInt(req.params!.id);
        const existing = await prisma.jalurPendaftaran.findFirst({
          where: {
            nama: {
              equals: value,
              mode: "insensitive",
            },
            id: { not: id },
          },
        });
        if (existing) {
          throw new ConflictError("Nama jalur pendaftaran sudah ada");
        }
      }
      return true;
    }),
];

export const getJalurPendaftaranByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.jalurPendaftaran.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Jalur pendaftaran tidak ditemukan");
      }
      return true;
    }),
];

export const deleteJalurPendaftaranValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.jalurPendaftaran.findUnique({
        where: { id: parseInt(value) },
      });

      if (!existing) {
        throw new NotFoundError("Jalur pendaftaran tidak ditemukan");
      }

      return true;
    }),
];

export const deleteJalurPendaftaranBulkValidation = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("Field 'ids' harus berupa array yang tidak kosong")
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new BadRequestError("Field 'ids' harus berupa array");
      }

      // Check if all elements are valid integers
      for (const id of value) {
        const numId = parseInt(id);
        if (isNaN(numId) || numId < 1) {
          throw new BadRequestError(`ID '${id}' tidak valid`);
        }
      }

      // Check for duplicates
      const uniqueIds = new Set(value.map((id) => parseInt(id)));
      if (uniqueIds.size !== value.length) {
        throw new BadRequestError("Tidak boleh ada ID yang duplikat");
      }

      // Limit bulk delete to reasonable number (e.g., max 100)
      if (value.length > 100) {
        throw new BadRequestError("Maksimal 100 jalur pendaftaran dapat dihapus sekaligus");
      }

      return true;
    }),
];

export const validateDeleteJalurPendaftaranValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.jalurPendaftaran.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Jalur pendaftaran tidak ditemukan");
      }
      return true;
    }),
];
