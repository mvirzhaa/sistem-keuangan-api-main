import { body, param, query } from "express-validator";
import { prisma } from "../../../config/database.js";
import { ConflictError, BadRequestError, NotFoundError } from "../../../types/errors.js";
import { LevelUnitKerja } from "@prisma/client";

const validLevels = Object.values(LevelUnitKerja);

export const createUnitKerjaValidation = [
  body("kode")
    .notEmpty()
    .withMessage("Kode wajib diisi")
    .isLength({ min: 2, max: 10 })
    .withMessage("Kode harus antara 2-10 karakter")
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage("Kode hanya boleh berisi huruf kapital, angka, dash, dan underscore")
    .trim()
    .custom(async (value) => {
      const existing = await prisma.unitKerja.findUnique({
        where: { kode: value },
      });
      if (existing) {
        throw new ConflictError("Kode unit kerja sudah ada");
      }
      return true;
    }),

  body("nama").notEmpty().withMessage("Nama wajib diisi").isLength({ min: 3, max: 100 }).withMessage("Nama harus antara 3-100 karakter").trim(),

  body("singkatan").optional().isLength({ min: 2, max: 20 }).withMessage("Singkatan harus antara 2-20 karakter").trim(),

  body("level")
    .notEmpty()
    .withMessage("Level wajib diisi")
    .isIn(validLevels)
    .withMessage(`Level harus salah satu dari: ${validLevels.join(", ")}`),

  body("parentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Parent ID harus berupa angka positif")
    .custom(async (value, { req }) => {
      if (value) {
        const parent = await prisma.unitKerja.findUnique({
          where: { id: parseInt(value) },
        });

        if (!parent) {
          throw new NotFoundError("Parent unit kerja tidak ditemukan");
        }

        // Validate hierarchy
        const level = req.body.level;
        if (level === LevelUnitKerja.UNIVERSITAS) {
          throw new BadRequestError("Unit kerja level UNIVERSITAS tidak boleh memiliki parent");
        }

        if (level === LevelUnitKerja.FAKULTAS && parent.level !== LevelUnitKerja.UNIVERSITAS) {
          throw new BadRequestError("Fakultas hanya bisa menjadi child dari Universitas");
        }

        if (level === LevelUnitKerja.PROGRAM_STUDI && parent.level !== LevelUnitKerja.FAKULTAS) {
          throw new BadRequestError("Program Studi hanya bisa menjadi child dari Fakultas");
        }
      }
      return true;
    }),
];

export const updateUnitKerjaValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.unitKerja.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Unit kerja tidak ditemukan");
      }
      return true;
    }),

  body("kode")
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage("Kode harus antara 2-10 karakter")
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage("Kode hanya boleh berisi huruf kapital, angka, dash, dan underscore")
    .trim()
    .custom(async (value, { req }) => {
      if (value) {
        const id = parseInt(req.params!.id);
        const existing = await prisma.unitKerja.findFirst({
          where: {
            kode: value,
            id: { not: id },
          },
        });
        if (existing) {
          throw new ConflictError("Kode unit kerja sudah ada");
        }
      }
      return true;
    }),

  body("nama").optional().isLength({ min: 3, max: 100 }).withMessage("Nama harus antara 3-100 karakter").trim(),

  body("singkatan").optional().isLength({ min: 2, max: 20 }).withMessage("Singkatan harus antara 2-20 karakter").trim(),

  body("level")
    .optional()
    .isIn(validLevels)
    .withMessage(`Level harus salah satu dari: ${validLevels.join(", ")}`),

  body("parentId")
    .optional()
    .custom(async (value, { req }) => {
      if (value !== undefined) {
        if (value === null) {
          return true; // Allow null for removing parent
        }

        if (!Number.isInteger(parseInt(value)) || parseInt(value) < 1) {
          throw new BadRequestError("Parent ID harus berupa angka positif");
        }

        const currentId = parseInt(req.params!.id);
        const parentId = parseInt(value);

        if (parentId === currentId) {
          throw new BadRequestError("Unit kerja tidak bisa menjadi parent dari dirinya sendiri");
        }

        const parent = await prisma.unitKerja.findUnique({
          where: { id: parentId },
        });

        if (!parent) {
          throw new NotFoundError("Parent unit kerja tidak ditemukan");
        }
      }
      return true;
    }),
];

export const getUnitKerjaByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.unitKerja.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Unit kerja tidak ditemukan");
      }
      return true;
    }),
];

export const deleteUnitKerjaValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.unitKerja.findUnique({
        where: { id: parseInt(value) },
        include: {
          children: true,
          fakultas: true,
          programStudi: true,
        },
      });

      if (!existing) {
        throw new NotFoundError("Unit kerja tidak ditemukan");
      }

      if (existing.children.length > 0) {
        throw new ConflictError("Tidak bisa menghapus unit kerja yang memiliki children");
      }

      if (existing.fakultas.length > 0 || existing.programStudi.length > 0) {
        throw new ConflictError("Tidak bisa menghapus unit kerja yang masih memiliki fakultas atau program studi");
      }

      return true;
    }),
];

export const getUnitKerjaByLevelValidation = [
  query("level")
    .notEmpty()
    .withMessage("Level wajib diisi")
    .isIn(validLevels)
    .withMessage(`Level harus salah satu dari: ${validLevels.join(", ")}`),
];

export const getUnitKerjaPathValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const existing = await prisma.unitKerja.findUnique({
        where: { id: parseInt(value) },
      });
      if (!existing) {
        throw new NotFoundError("Unit kerja tidak ditemukan");
      }
      return true;
    }),
];
