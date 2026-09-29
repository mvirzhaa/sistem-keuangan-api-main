import { body, param, query } from "express-validator";

export const getRekananValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page harus berupa angka positif").toInt(),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit harus berupa angka antara 1-100").toInt(),

  query("searchBy").optional().isIn(["all", "nama", "kota", "telepon", "email"]).withMessage("SearchBy harus salah satu dari: all, nama, kota, telepon, email"),

  query("searchValue").optional().isString().trim().withMessage("SearchValue harus berupa string"),
];

export const addRekananValidation = [
  body("nama").notEmpty().withMessage("Nama rekanan wajib diisi").isString().withMessage("Nama rekanan harus berupa string").isLength({ min: 2, max: 100 }).withMessage("Nama rekanan harus antara 2-100 karakter").trim(),

  body("kota").optional().isString().withMessage("Kota harus berupa string").isLength({ max: 50 }).withMessage("Kota maksimal 50 karakter").trim(),

  body("telepon")
    .optional()
    .isString()
    .withMessage("Telepon harus berupa string")
    .isLength({ max: 20 })
    .withMessage("Telepon maksimal 20 karakter")
    .matches(/^[0-9\-\+\(\)\s]*$/)
    .withMessage("Telepon hanya boleh mengandung angka, tanda hubung, plus, kurung, dan spasi")
    .trim(),

  body("email").optional().isEmail().withMessage("Format email tidak valid").isLength({ max: 100 }).withMessage("Email maksimal 100 karakter").normalizeEmail(),
];

export const updateRekananValidation = [
  param("id").notEmpty().withMessage("ID rekanan wajib diisi").isInt({ min: 1 }).withMessage("ID rekanan harus berupa angka positif").toInt(),

  body("nama").optional().isString().withMessage("Nama rekanan harus berupa string").isLength({ min: 2, max: 100 }).withMessage("Nama rekanan harus antara 2-100 karakter").trim(),

  body("kota").optional().isString().withMessage("Kota harus berupa string").isLength({ max: 50 }).withMessage("Kota maksimal 50 karakter").trim(),

  body("telepon")
    .optional()
    .isString()
    .withMessage("Telepon harus berupa string")
    .isLength({ max: 20 })
    .withMessage("Telepon maksimal 20 karakter")
    .matches(/^[0-9\-\+\(\)\s]*$/)
    .withMessage("Telepon hanya boleh mengandung angka, tanda hubung, plus, kurung, dan spasi")
    .trim(),

  body("email").optional().isEmail().withMessage("Format email tidak valid").isLength({ max: 100 }).withMessage("Email maksimal 100 karakter").normalizeEmail(),
];

export const deleteRekananValidation = [param("id").notEmpty().withMessage("ID rekanan wajib diisi").isInt({ min: 1 }).withMessage("ID rekanan harus berupa angka positif").toInt()];
