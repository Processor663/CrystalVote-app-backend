// src/middleware/validateSignUp.js
import { signUpSchema } from "../validators/signUpSchema.js";
import AppError from "../utils/appError.js ";
import { StatusCodes } from "http-status-codes";
import { logger } from "../lib/logger.js";

export function validateSignUp(req, res, next) {
  if (req.path !== "/api/auth/sign-up/email") {
    return next();
  }

  const result = signUpSchema.safeParse(req.body);

  if (!result.success) {
     logger.error("Failed to register user", {
       error: result.error.errors[0].message,
       stack: err.stack,
     });
    throw new AppError( "Invalid sign-up data", StatusCodes.BAD_REQUEST);

   
  }

   return res.status(400).json({
      error: result.error.errors[0].message,
    });
  next();
}
