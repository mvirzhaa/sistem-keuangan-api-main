import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        nama: string;
        roles: Role[];
      };
    }
  }
}

// Single middleware untuk authentication dan authorization
export const auth = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Authentication - Validasi JWT token
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Unauthorized access - Token required",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Unauthorized access - Token required",
        });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).json({
          message: "Server configuration error",
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret) as any;

      // Attach user info to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        nama: decoded.nama,
        roles: decoded.roles || [],
      };

      // 2. Authorization - Jika tidak ada role yang dibutuhkan, skip authorization
      if (allowedRoles.length === 0) {
        return next();
      }

      const userRoles = req.user.roles;

      // SUPER_ADMIN bisa mengakses semua endpoint
      if (userRoles.includes(Role.SUPER_ADMIN)) {
        return next();
      }

      // Check if user has at least one of the allowed roles
      const hasAuthorizedRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasAuthorizedRole) {
        return res.status(403).json({
          message: "Access denied - Insufficient permissions",
          requiredRoles: allowedRoles,
          userRoles: userRoles,
        });
      }

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: "Token expired - Please login again",
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          message: "Invalid token - Please login again",
        });
      }

      console.error("Authentication error:", error);
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }
  };
};

// Helper shortcuts untuk kemudahan (opsional)
export const authOnly = () => auth(); // Hanya butuh login, semua role boleh

export const authAdmin = () => auth(Role.ADMIN_KEUANGAN);

export const authOperator = () => auth(Role.OPERATOR_KEUANGAN);

export const authKeuangan = () => auth(Role.ADMIN_KEUANGAN, Role.OPERATOR_KEUANGAN, Role.KASUBAG_KEUANGAN);

export const authPimpinan = () => auth(Role.REKTOR, Role.WAKIL_REKTOR_2, Role.WAKIL_DEKAN_2, Role.KEPALA_TU_FAKULTAS);

// Untuk backward compatibility
export const authenticate = auth();
export const requireSuperAdmin = auth(); // SUPER_ADMIN akan otomatis bisa akses
export const requireAdmin = auth(Role.ADMIN_KEUANGAN);
export const requireKeuangan = auth(Role.ADMIN_KEUANGAN, Role.OPERATOR_KEUANGAN, Role.KASUBAG_KEUANGAN);
export const requirePimpinan = auth(Role.REKTOR, Role.WAKIL_REKTOR_2, Role.WAKIL_DEKAN_2, Role.KEPALA_TU_FAKULTAS);
