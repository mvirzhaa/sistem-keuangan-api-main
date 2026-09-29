import { body, param, query } from "express-validator";

export const getAllPotonganValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page harus berupa angka positif").toInt(),

  query("limit").optional().isInt({ min: 1 }).withMessage("Limit harus diatas angka 1").toInt(),

  query("searchBy")
    .optional()
    .isIn(["all", "nama", "periodeAwal", "periodeAkhir", "nominal", "anggaran", "jumlahPenerima", "realisasi", "memotongTagihan", "tipePotongan", "rekanan"])
    .withMessage("SearchBy harus salah satu dari: all, nama, periodeAwal, periodeAkhir, nominal, anggaran, jumlahPenerima, realisasi, memotongTagihan, tipePotongan, rekanan"),

  query("searchValue").optional().isString().trim(),

  query("filterJenisPotongan").optional().isIn(["POTONGAN", "BEASISWA", "all"]).withMessage("Filter jenis potongan harus POTONGAN, BEASISWA, atau all"),

  query("filterJenisTagihan").optional().isString().trim(),

  query("filterRekanan").optional().isInt({ min: 1 }).withMessage("Filter rekanan harus berupa angka positif").toInt(),

  query("filterTipePotongan").optional().isIn(["POTONGAN_RATA", "POTONGAN_AWAL", "all"]).withMessage("Filter tipe potongan harus POTONGAN_RATA, POTONGAN_AWAL, atau all"),
];

export const getPotonganByIdValidation = [param("id").notEmpty().withMessage("ID potongan wajib diisi").isString().withMessage("ID harus berupa string").trim()];

export const createPotonganValidation = [
  body("nama").notEmpty().withMessage("Nama potongan wajib diisi").isLength({ min: 3, max: 200 }).withMessage("Nama potongan harus antara 3-200 karakter").trim(),

  body("periodeAwalId").optional().isInt({ min: 1 }).withMessage("Periode awal harus berupa angka positif").toInt(),

  body("periodeAkhirId").optional().isInt({ min: 1 }).withMessage("Periode akhir harus berupa angka positif").toInt(),

  body("nominal").notEmpty().withMessage("Nominal potongan wajib diisi").isInt({ min: 0 }).withMessage("Nominal harus berupa angka positif").toInt(),

  body("anggaran").notEmpty().withMessage("Anggaran wajib diisi").isInt({ min: 0 }).withMessage("Anggaran harus berupa angka positif").toInt(),

  body("jenisPotongan").notEmpty().withMessage("Jenis potongan wajib diisi").isIn(["POTONGAN", "BEASISWA"]).withMessage("Jenis potongan harus POTONGAN atau BEASISWA"),

  body("rekananId").optional().isInt({ min: 1 }).withMessage("Rekanan harus berupa angka positif").toInt(),

  body("jumlahPenerima").optional().isInt({ min: 1 }).withMessage("Jumlah penerima harus berupa angka positif").toInt(),

  body("realisasi").optional().isInt({ min: 0 }).withMessage("Realisasi harus berupa angka positif").toInt(),

  body("isMemotongTagihan").optional().isBoolean().withMessage("Memotong tagihan harus berupa boolean").toBoolean(),

  body("tipePotongan").notEmpty().withMessage("Tipe potongan wajib diisi").isIn(["POTONGAN_RATA", "POTONGAN_AWAL"]).withMessage("Tipe potongan harus POTONGAN_RATA atau POTONGAN_AWAL"),
];

export const deletePotonganValidation = [param("id").notEmpty().withMessage("ID potongan wajib diisi").isString().withMessage("ID harus berupa string").trim()];

export const deleteBulkPotonganValidation = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("IDs harus berupa array dan tidak boleh kosong")
    .custom((value) => {
      // Check if all elements are strings
      if (!Array.isArray(value) || value.some((id) => typeof id !== "string" || !id.trim())) {
        throw new Error("Semua ID harus berupa string yang valid");
      }
      return true;
    }),
];

export const updatePotonganValidation = [
  param("id").notEmpty().withMessage("ID potongan wajib diisi").isString().withMessage("ID harus berupa string").trim(),

  body("nama").optional().isLength({ min: 3, max: 200 }).withMessage("Nama potongan harus antara 3-200 karakter").trim(),

  body("periodeAwalId").optional().isInt({ min: 1 }).withMessage("Periode awal harus berupa angka positif").toInt(),

  body("periodeAkhirId").optional().isInt({ min: 1 }).withMessage("Periode akhir harus berupa angka positif").toInt(),

  body("nominal").optional().isInt({ min: 0 }).withMessage("Nominal harus berupa angka positif").toInt(),

  body("anggaran").optional().isInt({ min: 0 }).withMessage("Anggaran harus berupa angka positif").toInt(),

  body("jenisPotongan").optional().isIn(["POTONGAN", "BEASISWA"]).withMessage("Jenis potongan harus POTONGAN atau BEASISWA"),

  body("rekananId").optional().isInt({ min: 1 }).withMessage("Rekanan harus berupa angka positif").toInt(),

  body("jumlahPenerima").optional().isInt({ min: 1 }).withMessage("Jumlah penerima harus berupa angka positif").toInt(),

  body("realisasi").optional().isInt({ min: 0 }).withMessage("Realisasi harus berupa angka positif").toInt(),

  body("isMemotongTagihan").optional().isBoolean().withMessage("Memotong tagihan harus berupa boolean").toBoolean(),

  body("tipePotongan").optional().isIn(["POTONGAN_RATA", "POTONGAN_AWAL"]).withMessage("Tipe potongan harus POTONGAN_RATA atau POTONGAN_AWAL"),
];

export const importExcelValidation = [
  // File validation will be handled by multer middleware
  // Additional custom validation can be added here if needed
];

export const addAturanPotonganValidation = [
  param("potonganId").notEmpty().withMessage("ID potongan wajib diisi").isString().withMessage("ID potongan harus berupa string").trim(),

  body("jenisTagihanId").notEmpty().withMessage("Jenis tagihan wajib diisi").isString().withMessage("Jenis tagihan harus berupa string").trim(),

  body("maksimalNominal").notEmpty().withMessage("Maksimal nominal wajib diisi").isInt({ min: 0 }).withMessage("Maksimal nominal harus berupa angka positif").toInt(),

  body("nomorUrut").optional().isInt({ min: 1 }).withMessage("Nomor urut harus berupa angka positif").toInt(),
];

export const getAllAturanPotonganValidation = [param("potonganId").notEmpty().withMessage("ID potongan wajib diisi").isString().withMessage("ID potongan harus berupa string").trim()];

export const updateAturanPotonganValidation = [
  param("id").notEmpty().withMessage("ID aturan potongan wajib diisi").isString().withMessage("ID aturan potongan harus berupa string").trim(),

  body("jenisTagihanId").optional().isString().withMessage("Jenis tagihan harus berupa string").trim(),

  body("maksimalNominal").optional().isInt({ min: 0 }).withMessage("Maksimal nominal harus berupa angka positif").toInt(),

  body("nomorUrut").optional().isInt({ min: 1 }).withMessage("Nomor urut harus berupa angka positif").toInt(),
];

export const deleteAturanPotonganValidation = [param("id").notEmpty().withMessage("ID aturan potongan wajib diisi").isString().withMessage("ID aturan potongan harus berupa string").trim()];
