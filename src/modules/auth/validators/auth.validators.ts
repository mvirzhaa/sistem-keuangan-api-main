import { body } from "express-validator";

export const loginValidation = [body("email").notEmpty().withMessage("Email wajib diisi").isEmail().withMessage("Format email tidak valid").normalizeEmail(), body("password").notEmpty().withMessage("Password wajib diisi")];
