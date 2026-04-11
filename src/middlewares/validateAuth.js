import { signUpSchema, signInSchema } from "../validators/authSchemas.js";
import AppError from "../utils/appError.js";
import { StatusCodes } from "http-status-codes";
import logger from "../lib/logger.js";

const schemaMap = {
  "/api/auth/sign-up/email": signUpSchema,
  "/api/auth/sign-in/email": signInSchema,
};

export function validateAuth(req, _res, next) {
  const schema = schemaMap[req.path];

  if (!schema) return next();

  const result = schema.safeParse(req.body);

  if (!result.success) {
    const isSignUp = req.path === "/api/auth/sign-up/email";

    const { fieldErrors } = result.error.flatten();
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages[0],
      ]),
    );

    logger.error(
      isSignUp ? "Failed to sign-up user" : "Failed to sign-in user",
      { errors }, 
    );

    const firstError =
      Object.values(errors)[0] ??
      "Invalid input data. Please check your inputs and try again.";

    return next(new AppError(firstError, StatusCodes.BAD_REQUEST)); // ✅ must be here
  }

  req.body = result.data;
 

  next();
}
