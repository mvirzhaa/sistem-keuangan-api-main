import { Router } from "express";
import { login } from "../controllers/auth.controllers.js";
import { loginValidation } from "../validators/auth.validators.js";
import { handleValidationErrors } from "../../../middlewares/validationMiddleware.js";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna
 *     description: Endpoint untuk login pengguna menggunakan email dan password
 *     tags: [Auth - Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmad.subagja@uika.ac.id"
 *                 description: "Email pengguna yang terdaftar"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "AdminKeuangan123!"
 *                 description: "Password pengguna"
 *           examples:
 *             admin-login:
 *               summary: Login Admin
 *               value:
 *                 email: "ahmad.subagja@uika.ac.id"
 *                 password: "AdminKeuangan123!"
 *             operator-login:
 *               summary: Login Operator
 *               value:
 *                 email: "siti.nurhaliza@uika.ac.id"
 *                 password: "OperatorKeuangan123!"
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             example:
 *               message: "Login berhasil"
 *               data:
 *                 user:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   nama: "Ahmad Subagja"
 *                   email: "ahmad.subagja@uika.ac.id"
 *                   roles: ["ADMIN_KEUANGAN"]
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: "24h"
 *       400:
 *         description: Validasi gagal
 *         content:
 *           application/json:
 *             example:
 *               message: "Validasi gagal"
 *               errors:
 *                 - field: "email"
 *                   message: "Format email tidak valid"
 *                   value: "invalid-email"
 *       401:
 *         description: Email atau password tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: "Email atau password tidak valid"
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Terjadi kesalahan saat login"
 */
router.post("/login", loginValidation, handleValidationErrors, login);

export default router;
