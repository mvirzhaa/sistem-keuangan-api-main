import { body, param } from "express-validator";
import { prisma } from "../../../config/database.js";
import { ConflictError, BadRequestError, NotFoundError } from "../../../types/errors.js";
import { Role } from "@prisma/client";

const validRoles = Object.values(Role);

export const createAccountValidation = [
  body("nama").notEmpty().withMessage("Nama wajib diisi").isLength({ min: 2, max: 100 }).withMessage("Nama harus antara 2-100 karakter").trim(),

  body("email")
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail()
    .custom(async (value) => {
      const existing = await prisma.user.findUnique({
        where: { email: value },
      });
      if (existing) {
        throw new ConflictError("Email sudah terdaftar dalam sistem");
      }
      return true;
    }),

  body("password").notEmpty().withMessage("Password wajib diisi").isLength({ min: 6, max: 32 }).withMessage("Password harus antara 6-32 karakter"),

  body("roles")
    .isArray({ min: 1 })
    .withMessage("Role harus berupa array dan minimal satu role")
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new BadRequestError("Role harus berupa array");
      }

      // Check if all roles are valid
      const invalidRoles = value.filter((role) => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        throw new BadRequestError(`Role tidak valid: ${invalidRoles.join(", ")}`);
      }

      // Check for duplicate roles
      const uniqueRoles = [...new Set(value)];
      if (uniqueRoles.length !== value.length) {
        throw new BadRequestError("Role tidak boleh duplikat");
      }

      return true;
    }),
];

export const getUserByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isUUID()
    .withMessage("ID harus berupa UUID yang valid")
    .custom(async (value) => {
      const existing = await prisma.user.findUnique({
        where: { id: value },
      });
      if (!existing) {
        throw new NotFoundError("Pengguna tidak ditemukan");
      }
      return true;
    }),
];

export const deleteUserValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID wajib diisi")
    .isUUID()
    .withMessage("ID harus berupa UUID yang valid")
    .custom(async (value) => {
      const existing = await prisma.user.findUnique({
        where: { id: value },
      });
      if (!existing) {
        throw new NotFoundError("Pengguna tidak ditemukan");
      }
      return true;
    }),
];
