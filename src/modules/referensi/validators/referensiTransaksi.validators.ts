import { body, param, validationResult } from "express-validator";
import { prisma } from "../../../config/database.js";
import { NotFoundError, ConflictError, BadRequestError } from "../../../types/errors.js";

/**
 * Validation rules untuk create kelompok
 */
export const createKelompokValidation = [
  body("kode")
    .notEmpty()
    .withMessage("Kode kelompok wajib diisi")
    .isLength({ min: 1, max: 10 })
    .withMessage("Kode kelompok maksimal 10 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode kelompok hanya boleh mengandung huruf dan angka")
    .custom(async (value) => {
      // Check if kode already exists
      const existing = await prisma.kelompok.findUnique({
        where: { kode: value },
      });
      if (existing) {
        throw new ConflictError("Kode kelompok sudah digunakan");
      }
      return true;
    }),

  body("nama").notEmpty().withMessage("Nama kelompok wajib diisi").isLength({ min: 2, max: 100 }).withMessage("Nama kelompok harus antara 2-100 karakter").trim(),

  body("jenisUserId")
    .isInt({ min: 1 })
    .withMessage("Jenis User ID harus berupa angka positif")
    .custom(async (value) => {
      // Check if jenisUser exists
      const jenisUser = await prisma.jenisUser.findUnique({
        where: { id: parseInt(value) },
      });
      if (!jenisUser) {
        throw new NotFoundError("Jenis User tidak ditemukan");
      }
      return true;
    }),

  body("jenisTransaksiId")
    .isInt({ min: 1 })
    .withMessage("Jenis Transaksi ID harus berupa angka positif")
    .custom(async (value) => {
      // Check if jenisTransaksi exists
      const jenisTransaksi = await prisma.jenisTransaksi.findUnique({
        where: { id: parseInt(value) },
      });
      if (!jenisTransaksi) {
        throw new NotFoundError("Jenis Transaksi tidak ditemukan");
      }
      return true;
    }),
];

/**
 * Validation rules untuk update kelompok
 */
export const updateKelompokValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const kelompok = await prisma.kelompok.findUnique({
        where: { id: parseInt(value) },
      });
      if (!kelompok) {
        throw new NotFoundError("Kelompok tidak ditemukan");
      }
      return true;
    }),

  body("kode")
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage("Kode kelompok maksimal 10 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode kelompok hanya boleh mengandung huruf dan angka")
    .custom(async (value, { req }) => {
      if (value) {
        // Check if kode already exists
        const existing = await prisma.kelompok.findUnique({
          where: { kode: value },
        });
        // Check if kode exists and it's not the current record being updated
        if (existing && existing.id !== parseInt(req.params?.id)) {
          throw new ConflictError("Kode kelompok sudah digunakan");
        }
      }
      return true;
    }),

  body("nama").optional().isLength({ min: 3, max: 100 }).withMessage("Nama kelompok harus antara 3-100 karakter").trim(),

  body("jenisUserId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Jenis User ID harus berupa angka positif")
    .custom(async (value) => {
      if (value) {
        const jenisUser = await prisma.jenisUser.findUnique({
          where: { id: parseInt(value) },
        });
        if (!jenisUser) {
          throw new NotFoundError("Jenis User tidak ditemukan");
        }
      }
      return true;
    }),

  body("jenisTransaksiId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Jenis Transaksi ID harus berupa angka positif")
    .custom(async (value) => {
      if (value) {
        const jenisTransaksi = await prisma.jenisTransaksi.findUnique({
          where: { id: parseInt(value) },
        });
        if (!jenisTransaksi) {
          throw new NotFoundError("Jenis Transaksi tidak ditemukan");
        }
      }
      return true;
    }),
];

export const deleteKelompokValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID harus berupa angka positif")
    .custom(async (value) => {
      const kelompok = await prisma.kelompok.findUnique({
        where: { id: parseInt(value) },
      });
      if (!kelompok) {
        throw new NotFoundError("Kelompok tidak ditemukan");
      }
      return true;
    }),
];

export const createJenisTagihanValidation = [
  body("kode")
    .notEmpty()
    .withMessage("Kode jenis tagihan wajib diisi")
    .isLength({ min: 1, max: 20 })
    .withMessage("Kode jenis tagihan maksimal 20 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode jenis tagihan hanya boleh mengandung huruf dan angka")
    .custom(async (value) => {
      const existing = await prisma.jenisTagihan.findUnique({
        where: { kode: value },
      });
      if (existing) {
        throw new ConflictError("Kode jenis tagihan sudah digunakan");
      }
      return true;
    }),

  body("namaJenisTagihan").notEmpty().withMessage("Nama jenis tagihan wajib diisi").isLength({ min: 3, max: 200 }).withMessage("Nama jenis tagihan harus antara 3-200 karakter").trim(),

  body("kelompokId")
    .isInt({ min: 1 })
    .withMessage("Kelompok ID harus berupa angka positif")
    .custom(async (value) => {
      const kelompok = await prisma.kelompok.findUnique({
        where: { id: parseInt(value) },
      });
      if (!kelompok) {
        throw new NotFoundError("Kelompok tidak ditemukan");
      }
      return true;
    }),

  body("jenisBiayaNeofeeder")
    .optional({
      values: "null",
    })
    .isIn(["BIAYA_MASUK", "BIAYA_SEMESTER", "TIDAK_DILAPORKAN"])
    .withMessage("Jenis biaya neofeeder harus salah satu dari: BIAYA_MASUK, BIAYA_SEMESTER, TIDAK_DILAPORKAN"),

  body("frekuensiId")
    .isInt({ min: 1 })
    .withMessage("Frekuensi ID harus berupa angka positif")
    .custom(async (value) => {
      const frekuensi = await prisma.frekuensi.findUnique({
        where: { id: parseInt(value) },
      });
      if (!frekuensi) {
        throw new NotFoundError("Frekuensi tidak ditemukan");
      }
      return true;
    }),

  body("eventKegiatanAkademikId")
    .optional({ values: "null" })
    .isInt({ min: 1 })
    .withMessage("Event Kegiatan Akademik ID harus berupa angka positif")
    .custom(async (value) => {
      if (value) {
        const kegiatanAkademik = await prisma.kegiatanAkademik.findUnique({
          where: { id: parseInt(value) },
        });
        if (!kegiatanAkademik) {
          throw new NotFoundError("Kegiatan Akademik tidak ditemukan");
        }
        // Validasi harus event
        if (!kegiatanAkademik.isEvent) {
          throw new BadRequestError("Kegiatan Akademik yang dipilih harus bertipe event");
        }
      }
      return true;
    }),

  body("isMahasiswa").optional().isBoolean().withMessage("isMahasiswa harus berupa boolean"),

  body("isPendaftar").optional().isBoolean().withMessage("isPendaftar harus berupa boolean"),

  body("isGenerateKuliah").optional().isBoolean().withMessage("isGenerateKuliah harus berupa boolean"),

  body("isSevimaPay").optional().isBoolean().withMessage("isSevimaPay harus berupa boolean"),
];

export const updateJenisTagihanValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID jenis tagihan wajib diisi")
    .isUUID()
    .withMessage("ID harus berupa UUID yang valid")
    .custom(async (value) => {
      const jenisTagihan = await prisma.jenisTagihan.findUnique({
        where: { id: value },
      });
      if (!jenisTagihan) {
        throw new NotFoundError("Jenis tagihan tidak ditemukan");
      }
      return true;
    }),

  body("kode")
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage("Kode jenis tagihan maksimal 20 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode jenis tagihan hanya boleh mengandung huruf dan angka")
    .custom(async (value, { req }) => {
      if (value) {
        const existing = await prisma.jenisTagihan.findUnique({
          where: { kode: value },
        });
        // Check if kode exists and it's not the current record being updated
        if (existing && existing.id !== req.params?.id) {
          throw new ConflictError("Kode jenis tagihan sudah digunakan");
        }
      }
      return true;
    }),

  body("namaJenisTagihan").optional().isLength({ min: 3, max: 200 }).withMessage("Nama jenis tagihan harus antara 3-200 karakter").trim(),

  body("kelompokId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Kelompok ID harus berupa angka positif")
    .custom(async (value) => {
      if (value) {
        const kelompok = await prisma.kelompok.findUnique({
          where: { id: parseInt(value) },
        });
        if (!kelompok) {
          throw new NotFoundError("Kelompok tidak ditemukan");
        }
      }
      return true;
    }),

  body("jenisBiayaNeofeeder").optional().isIn(["BIAYA_MASUK", "BIAYA_SEMESTER", "TIDAK_DILAPORKAN"]).withMessage("Jenis biaya neofeeder harus salah satu dari: BIAYA_MASUK, BIAYA_SEMESTER, TIDAK_DILAPORKAN"),

  body("frekuensiId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Frekuensi ID harus berupa angka positif")
    .custom(async (value) => {
      if (value) {
        const frekuensi = await prisma.frekuensi.findUnique({
          where: { id: parseInt(value) },
        });
        if (!frekuensi) {
          throw new NotFoundError("Frekuensi tidak ditemukan");
        }
      }
      return true;
    }),

  body("eventKegiatanAkademikId")
    .optional()
    .custom(async (value) => {
      // Skip validation jika value adalah null, undefined, atau falsy
      if (!value && value !== 0) {
        return true;
      }

      // Validasi harus integer positif
      const numValue = Number(value);
      if (!Number.isInteger(numValue) || numValue < 1) {
        throw new BadRequestError("Event Kegiatan Akademik ID harus berupa angka positif");
      }

      // Validasi kegiatan akademik exists
      const kegiatanAkademik = await prisma.kegiatanAkademik.findUnique({
        where: { id: numValue },
      });
      if (!kegiatanAkademik) {
        throw new NotFoundError("Kegiatan Akademik tidak ditemukan");
      }

      // Validasi harus event
      if (!kegiatanAkademik.isEvent) {
        throw new BadRequestError("Kegiatan Akademik yang dipilih harus bertipe event");
      }

      return true;
    }),

  body("isMahasiswa").optional().isBoolean().withMessage("isMahasiswa harus berupa boolean"),

  body("isPendaftar").optional().isBoolean().withMessage("isPendaftar harus berupa boolean"),

  body("isGenerateKuliah").optional().isBoolean().withMessage("isGenerateKuliah harus berupa boolean"),

  body("isSevimaPay").optional().isBoolean().withMessage("isSevimaPay harus berupa boolean"),
];

export const deleteJenisTagihanValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID jenis tagihan wajib diisi")
    .isUUID()
    .withMessage("ID harus berupa UUID yang valid")
    .custom(async (value) => {
      const jenisTagihan = await prisma.jenisTagihan.findUnique({
        where: { id: value },
      });
      if (!jenisTagihan) {
        throw new NotFoundError("Jenis tagihan tidak ditemukan");
      }
      return true;
    }),
];

export const deleteBulkJenisTagihanValidation = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("IDs harus berupa array dan tidak boleh kosong")
    .custom((value) => {
      // Validate each ID is a UUID
      for (const id of value) {
        if (!id || typeof id !== "string") {
          throw new BadRequestError("Setiap ID harus berupa string yang valid");
        }
        // Basic UUID validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          throw new BadRequestError(`ID ${id} bukan UUID yang valid`);
        }
      }
      return true;
    })
    .custom(async (value) => {
      // Check if all IDs exist
      const existingRecords = await prisma.jenisTagihan.findMany({
        where: {
          id: {
            in: value,
          },
        },
        select: { id: true },
      });

      const foundIds = existingRecords.map((record) => record.id);
      const notFoundIds = value.filter((id: string) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundError(`Jenis tagihan dengan ID ${notFoundIds.join(", ")} tidak ditemukan`);
      }

      return true;
    }),
];

export const updateBulkJenisTagihanValidation = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("IDs harus berupa array dan tidak boleh kosong")
    .custom((value) => {
      // Validate each ID is a UUID
      for (const id of value) {
        if (!id || typeof id !== "string") {
          throw new BadRequestError("Setiap ID harus berupa string yang valid");
        }
        // Basic UUID validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          throw new BadRequestError(`ID ${id} bukan UUID yang valid`);
        }
      }
      return true;
    })
    .custom(async (value) => {
      // Check if all IDs exist
      const existingRecords = await prisma.jenisTagihan.findMany({
        where: {
          id: {
            in: value,
          },
        },
        select: { id: true },
      });

      const foundIds = existingRecords.map((record) => record.id);
      const notFoundIds = value.filter((id: string) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundError(`Jenis tagihan dengan ID ${notFoundIds.join(", ")} tidak ditemukan`);
      }

      return true;
    }),

  body("kode")
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage("Kode jenis tagihan maksimal 20 karakter")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Kode jenis tagihan hanya boleh mengandung huruf dan angka")
    .custom(async (value, { req }) => {
      if (value) {
        // For bulk update, we need to check if the kode conflicts with any existing record
        // that is NOT in the update list
        const existing = await prisma.jenisTagihan.findUnique({
          where: { kode: value },
        });

        if (existing && !req.body.ids.includes(existing.id)) {
          throw new ConflictError("Kode jenis tagihan sudah digunakan oleh record lain");
        }
      }
      return true;
    }),

  body("namaJenisTagihan").optional().isLength({ min: 3, max: 200 }).withMessage("Nama jenis tagihan harus antara 3-200 karakter").trim(),

  body("kelompokId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Kelompok ID harus berupa angka positif")
    .custom(async (value) => {
      if (value) {
        const kelompok = await prisma.kelompok.findUnique({
          where: { id: parseInt(value) },
        });
        if (!kelompok) {
          throw new NotFoundError("Kelompok tidak ditemukan");
        }
      }
      return true;
    }),

  body("jenisBiayaNeofeeder").optional().isIn(["BIAYA_MASUK", "BIAYA_SEMESTER", "TIDAK_DILAPORKAN"]).withMessage("Jenis biaya neofeeder harus salah satu dari: BIAYA_MASUK, BIAYA_SEMESTER, TIDAK_DILAPORKAN"),

  body("frekuensiId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Frekuensi ID harus berupa angka positif")
    .custom(async (value) => {
      if (value) {
        const frekuensi = await prisma.frekuensi.findUnique({
          where: { id: parseInt(value) },
        });
        if (!frekuensi) {
          throw new NotFoundError("Frekuensi tidak ditemukan");
        }
      }
      return true;
    }),

  body("eventKegiatanAkademikId")
    .optional()
    .custom(async (value) => {
      // Skip validation jika value adalah null, undefined, atau falsy
      if (!value && value !== 0) {
        return true;
      }

      // Validasi harus integer positif
      const numValue = Number(value);
      if (!Number.isInteger(numValue) || numValue < 1) {
        throw new BadRequestError("Event Kegiatan Akademik ID harus berupa angka positif");
      }

      // Validasi kegiatan akademik exists
      const kegiatanAkademik = await prisma.kegiatanAkademik.findUnique({
        where: { id: numValue },
      });
      if (!kegiatanAkademik) {
        throw new NotFoundError("Kegiatan Akademik tidak ditemukan");
      }

      // Validasi harus event
      if (!kegiatanAkademik.isEvent) {
        throw new BadRequestError("Kegiatan Akademik yang dipilih harus bertipe event");
      }

      return true;
    }),

  body("isMahasiswa").optional().isBoolean().withMessage("isMahasiswa harus berupa boolean"),

  body("isPendaftar").optional().isBoolean().withMessage("isPendaftar harus berupa boolean"),

  body("isGenerateKuliah").optional().isBoolean().withMessage("isGenerateKuliah harus berupa boolean"),

  body("isSevimaPay").optional().isBoolean().withMessage("isSevimaPay harus berupa boolean"),

  // Validation to ensure at least one field is provided for update
  body().custom((value) => {
    const updateFields = ["kode", "namaJenisTagihan", "kelompokId", "jenisBiayaNeofeeder", "frekuensiId", "eventKegiatanAkademikId", "isMahasiswa", "isPendaftar", "isGenerateKuliah", "isSevimaPay"];

    const hasUpdateField = updateFields.some((field) => value[field] !== undefined);

    if (!hasUpdateField) {
      throw new BadRequestError("Minimal satu field harus disediakan untuk update");
    }

    return true;
  }),
];

export const updateJenisBiayaBulkValidation = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("IDs harus berupa array dan tidak boleh kosong")
    .custom((value) => {
      // Validate each ID is a UUID
      for (const id of value) {
        if (!id || typeof id !== "string") {
          throw new BadRequestError("Setiap ID harus berupa string yang valid");
        }
      }
      return true;
    })
    .custom(async (value) => {
      // Check if all IDs exist
      const existingRecords = await prisma.jenisTagihan.findMany({
        where: {
          id: {
            in: value,
          },
        },
        select: { id: true },
      });

      const foundIds = existingRecords.map((record) => record.id);
      const notFoundIds = value.filter((id: string) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundError(`Jenis tagihan dengan ID ${notFoundIds.join(", ")} tidak ditemukan`);
      }

      return true;
    }),

  body("jenisBiayaNeofeeder").optional({ values: "null" }).isIn(["BIAYA_MASUK", "BIAYA_SEMESTER", "TIDAK_DILAPORKAN"]).withMessage("Jenis biaya neofeeder harus salah satu dari: BIAYA_MASUK, BIAYA_SEMESTER, TIDAK_DILAPORKAN"),

  // Validation to ensure jenisBiayaNeofeeder field is provided
  body().custom((value) => {
    if (value.jenisBiayaNeofeeder === undefined) {
      throw new BadRequestError("Field jenisBiayaNeofeeder harus disediakan untuk update");
    }
    return true;
  }),
];
