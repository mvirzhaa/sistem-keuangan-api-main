import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/database.js";
import { InternalServerError, UnauthorizedError, NotFoundError } from "../../../types/errors.js";

export class AuthService {
  async login(email: string, password: string) {
    try {
      // Find user with roles
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          roles: {
            select: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedError("Email atau password tidak valid");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError("Email atau password tidak valid");
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new InternalServerError("JWT secret tidak dikonfigurasi");
      }

      const userRoles = user.roles.map((r) => r.role);

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          nama: user.nama,
          roles: userRoles,
        },
        jwtSecret,
        {
          expiresIn: "1h",
          issuer: "sistem-keuangan-uika",
          audience: "sistem-keuangan-users",
        }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        message: "Login berhasil",
        data: {
          user: {
            ...userWithoutPassword,
            roles: userRoles,
          },
          token,
          expiresIn: "1h",
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      console.error("Error in login:", error);
      throw new InternalServerError("Gagal melakukan login");
    }
  }
}
