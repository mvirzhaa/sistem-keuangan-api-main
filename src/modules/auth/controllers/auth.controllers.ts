import { Request, Response } from "express";
import { AuthService } from "../services/auth.services.js";
import { ConflictError, InternalServerError, UnauthorizedError, NotFoundError } from "../../../types/errors.js";

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json(result);
  } catch (error) {
    console.error("Error in login:", error);

    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat login",
    });
  }
};
