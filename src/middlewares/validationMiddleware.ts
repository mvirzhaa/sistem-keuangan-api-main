import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import { BaseError } from "../types/errors.js";

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Check if any error is a custom error (from validator custom functions)
    const customErrors = errors.array().filter((error) => error.msg instanceof BaseError || (typeof error.msg === "object" && error.msg.name && error.msg.statusCode));

    if (customErrors.length > 0) {
      // If there are custom errors, use the first one as the main error
      const firstCustomError = customErrors[0];

      if (firstCustomError && firstCustomError.msg instanceof BaseError) {
        res.status(firstCustomError.msg.statusCode).json({
          message: firstCustomError.msg.message,
        });
        return;
      }
    }

    // Default validation error handling
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === "field" ? error.path : "unknown",
      message: error.msg instanceof BaseError ? error.msg.message : error.msg,
      value: error.type === "field" ? error.value : undefined,
    }));

    res.status(400).json({
      message: "Validasi gagal",
      errors: formattedErrors,
    });
    return;
  }

  next();
};
