import { body, param, query } from "express-validator";

export const getAllVouchersValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page harus berupa angka positif").toInt(),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit harus berupa angka antara 1-100").toInt(),

  query("searchBy")
    .optional()
    .isIn(["all", "voucher", "kode", "periodeAwal", "periodeAkhir", "tanggalExpired", "nominal"])
    .withMessage("SearchBy harus salah satu dari: all, voucher, kode, periodeAwal, periodeAkhir, tanggalExpired, nominal"),

  query("searchValue").optional().isString().trim().withMessage("SearchValue harus berupa string"),
];

export const addVoucherValidation = [
  body("nama").notEmpty().withMessage("Nama voucher wajib diisi").isString().withMessage("Nama voucher harus berupa string").isLength({ min: 3, max: 200 }).withMessage("Nama voucher harus antara 3-200 karakter").trim(),

  body("kode")
    .optional()
    .isString()
    .withMessage("Kode voucher harus berupa string")
    .isLength({ max: 20 })
    .withMessage("Kode voucher maksimal 20 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode voucher hanya boleh mengandung huruf dan angka")
    .trim(),

  body("generateKodeOtomatis").optional().isBoolean().withMessage("Generate kode otomatis harus berupa boolean"),

  body("nominal").notEmpty().withMessage("Nominal voucher wajib diisi").isInt({ min: 1 }).withMessage("Nominal harus berupa angka positif").toInt(),

  body("periodeAwalId").optional().isInt({ min: 1 }).withMessage("Periode awal ID harus berupa angka positif").toInt(),

  body("periodeAkhirId").optional().isInt({ min: 1 }).withMessage("Periode akhir ID harus berupa angka positif").toInt(),

  body("tanggalExpired").optional().isISO8601().withMessage("Format tanggal expired harus berupa ISO8601 (YYYY-MM-DD)").toDate(),

  body("anggaran").notEmpty().withMessage("Anggaran voucher wajib diisi").isInt({ min: 1 }).withMessage("Anggaran harus berupa angka positif").toInt(),

  body("realisasi").optional().isInt({ min: 0 }).withMessage("Realisasi harus berupa angka positif atau nol").toInt(),
];

export const updateVoucherValidation = [
  param("id").notEmpty().withMessage("ID voucher wajib diisi").isString().withMessage("ID harus berupa string").trim(),

  body("nama").optional().isString().withMessage("Nama voucher harus berupa string").isLength({ min: 3, max: 200 }).withMessage("Nama voucher harus antara 3-200 karakter").trim(),

  body("kode")
    .optional()
    .isString()
    .withMessage("Kode voucher harus berupa string")
    .isLength({ max: 20 })
    .withMessage("Kode voucher maksimal 20 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode voucher hanya boleh mengandung huruf dan angka")
    .trim(),

  body("generateKodeOtomatis").optional().isBoolean().withMessage("Generate kode otomatis harus berupa boolean"),

  body("nominal").optional().isInt({ min: 1 }).withMessage("Nominal harus berupa angka positif").toInt(),

  body("periodeAwalId")
    .optional()
    .custom((value) => {
      if (value === null) return true;
      return Number.isInteger(value) && value > 0;
    })
    .withMessage("Periode awal ID harus berupa angka positif atau null")
    .toInt(),

  body("periodeAkhirId")
    .optional()
    .custom((value) => {
      if (value === null) return true;
      return Number.isInteger(value) && value > 0;
    })
    .withMessage("Periode akhir ID harus berupa angka positif atau null")
    .toInt(),

  body("tanggalExpired")
    .optional()
    .custom((value) => {
      if (value === null) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .withMessage("Format tanggal expired harus berupa ISO8601 (YYYY-MM-DD) atau null"),

  body("anggaran").optional().isInt({ min: 1 }).withMessage("Anggaran harus berupa angka positif").toInt(),

  body("realisasi")
    .optional()
    .custom((value) => {
      if (value === null) return true;
      return Number.isInteger(value) && value >= 0;
    })
    .withMessage("Realisasi harus berupa angka positif, nol, atau null")
    .toInt(),
];

export const deleteVoucherValidation = [param("id").notEmpty().withMessage("ID voucher wajib diisi").isString().withMessage("ID harus berupa string").trim()];

export const deleteBulkVouchersValidation = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("IDs harus berupa array dan tidak boleh kosong")
    .custom((ids) => {
      // Check if all IDs are valid strings
      for (const id of ids) {
        if (typeof id !== "string" || id.trim().length === 0) {
          throw new Error(`ID ${id} tidak valid - harus berupa string non-empty`);
        }
      }
      return true;
    }),
];

export const addAturanVoucherValidation = [
  param("voucherId").notEmpty().withMessage("ID voucher wajib diisi").isString().withMessage("ID voucher harus berupa string").trim(),

  body("jenisTagihanId").notEmpty().withMessage("ID jenis tagihan wajib diisi").isString().withMessage("ID jenis tagihan harus berupa string").trim(),

  body("maksimalNominal").notEmpty().withMessage("Maksimal nominal wajib diisi").isInt({ min: 1 }).withMessage("Maksimal nominal harus berupa angka positif").toInt(),
];

export const updateAturanVoucherValidation = [
  param("id").notEmpty().withMessage("ID aturan voucher wajib diisi").isString().withMessage("ID aturan voucher harus berupa string").trim(),

  body("jenisTagihanId").optional().isString().withMessage("ID jenis tagihan harus berupa string").trim(),

  body("maksimalNominal").optional().isInt({ min: 1 }).withMessage("Maksimal nominal harus berupa angka positif").toInt(),
];

export const deleteAturanVoucherValidation = [param("id").notEmpty().withMessage("ID aturan voucher wajib diisi").isString().withMessage("ID aturan voucher harus berupa string").trim()];

export const getAllAturanVoucherValidation = [param("voucherId").notEmpty().withMessage("ID voucher wajib diisi").isString().withMessage("ID voucher harus berupa string").trim()];
