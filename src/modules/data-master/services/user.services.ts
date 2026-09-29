import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/database.js";
import { User, Role } from "@prisma/client";
import { ConflictError, InternalServerError, UnauthorizedError, NotFoundError } from "../../../types/errors.js";

export class UserService {
  async createAccount(data: { nama: string; email: string; password: string; roles: Role[] }) {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError("Email sudah terdaftar dalam sistem");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user with roles in transaction
      const newUser = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            nama: data.nama,
            email: data.email,
            password: hashedPassword,
          },
        });

        // Create user roles
        const userRoles = await Promise.all(
          data.roles.map((role) =>
            tx.userRoles.create({
              data: {
                userId: user.id,
                role: role,
              },
            })
          )
        );

        return {
          ...user,
          roles: userRoles.map((ur) => ur.role),
        };
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;

      return {
        message: "Akun berhasil dibuat",
        data: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error("Error in createAccount:", error);
      throw new InternalServerError("Gagal membuat akun");
    }
  }

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        include: {
          roles: {
            select: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Remove passwords from response
      const usersWithoutPasswords = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          roles: user.roles.map((r) => r.role),
        };
      });

      return {
        message: "Data pengguna berhasil diambil",
        data: usersWithoutPasswords,
      };
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw new InternalServerError("Gagal mengambil data pengguna");
    }
  }

  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: {
            select: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError("Pengguna tidak ditemukan");
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        message: "Data pengguna berhasil diambil",
        data: {
          ...userWithoutPassword,
          roles: user.roles.map((r) => r.role),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in getUserById:", error);
      throw new InternalServerError("Gagal mengambil data pengguna");
    }
  }

  async deleteUser(id: string) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
        },
      });

      if (!existingUser) {
        throw new NotFoundError("Pengguna tidak ditemukan");
      }

      // Delete user and roles in transaction
      const deletedUser = await prisma.$transaction(async (tx) => {
        // Delete user roles first
        await tx.userRoles.deleteMany({
          where: { userId: id },
        });

        // Delete user
        const user = await tx.user.delete({
          where: { id },
          select: {
            id: true,
            nama: true,
            email: true,
            createdAt: true,
          },
        });

        return user;
      });

      return {
        message: "Pengguna berhasil dihapus",
        deletedRecord: {
          ...deletedUser,
          roles: existingUser.roles.map((r) => r.role),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in deleteUser:", error);
      throw new InternalServerError("Gagal menghapus pengguna");
    }
  }
}
