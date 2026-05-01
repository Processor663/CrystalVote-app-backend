import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import {
  getUser,
  getAllUsers,
  updateUser,
} from "../services/user.service.js";
import { updateUserSchema } from "../validators/candidate.validator.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";
import { logAudit } from "../services/audit.service.js";

export const getUserController = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new AppError("User ID is required", StatusCodes.BAD_REQUEST);
  }
  const { id } = req.user;
  const users = await getUser(id);
  res.json({ success: true, data: users });
});

export const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  res.json({ success: true, total: users.length, data: users });
});

export const updateUserController = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new AppError("User ID is required", StatusCodes.BAD_REQUEST);
  }
  const { id } = req.user;
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten();
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages[0],
      ]),
    );

    const firstError =
      Object.values(formErrors)[0] ||
      Object.values(errors)[0] ||
      "Invalid input data. Please check your inputs and try again.";
    const errorMessage = firstError;

    logger.warn("Update User validation failed", {
      errors,
      formErrors,
    });

    throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
  }

  const updatedUser = await updateUser(id, result.data);

  await logAudit({
    userId: req.user?.id || null,
    action: "USER_UPDATED",
    resource: "USER",
    metadata: { userId: id },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });
  res.json({ success: true, data: updatedUser });
});
