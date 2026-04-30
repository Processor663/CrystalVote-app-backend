import { StatusCodes } from "http-status-codes"
import AppError from "../utils/appError.js"


export const authorize =
  (roles = []) =>
  (req, res, next) => {
    console.log("User:", req.user);
    if (!req.user) {
      return next(new AppError("Unauthorized", StatusCodes.UNAUTHORIZED));
    }

    // Check if the user's role is allowed
    if (
      !roles.map((r) => r.toLowerCase()).includes(req.user.role?.toLowerCase())
    ) {
      return next(new AppError("Forbidden", StatusCodes.FORBIDDEN));
    }

    next();
  };