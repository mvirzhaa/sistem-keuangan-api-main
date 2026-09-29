import { Request, Response } from "express";
import { UserService } from "../services/user.services.js";
import { ConflictError, InternalServerError, UnauthorizedError, NotFoundError } from "../../../types/errors.js";

const userService = new UserService();

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { nama, email, password, roles } = req.body;

    const result = await userService.createAccount({
      nama,
      email,
      password,
      roles,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createAccount:", error);

    if (error instanceof ConflictError) {
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
      message: "Terjadi kesalahan saat membuat akun",
    });
  }
};

export const getAllUsers = async (_: Request, res: Response) => {
  try {
    const result = await userService.getAllUsers();

    res.json(result);
  } catch (error) {
    console.error("Error in getAllUsers:", error);

    if (error instanceof InternalServerError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data pengguna",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await userService.getUserById(id!);

    res.json(result);
  } catch (error) {
    console.error("Error in getUserById:", error);

    if (error instanceof NotFoundError) {
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
      message: "Terjadi kesalahan saat mengambil data pengguna",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await userService.deleteUser(id!);

    res.json(result);
  } catch (error) {
    console.error("Error in deleteUser:", error);

    if (error instanceof NotFoundError) {
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
      message: "Terjadi kesalahan saat menghapus pengguna",
    });
  }
};
