import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import {
  getCandidate,
  getAllCandidates,
  updateCandidate,
} from "../services/candidate.service.js";
import {
  updateCandidateSchema,
} from "../validators/candidate.validator.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";
import { logAudit } from "../services/audit.service.js";

export const getCandidateController = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const candidates = await getCandidate(id);
  res.json({ success: true, data: candidates });
});

export const getAllCandidatesController = asyncHandler(async (req, res) => {
  const candidates = await getAllCandidates();
  res.json({ success: true, total: candidates.length, data: candidates });
});

export const updateCandidateController = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const result = updateCandidateSchema.safeParse(req.body);

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

    logger.warn("Update Candidate validation failed", {
      errors,
      formErrors,
    });

    throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
  }

  const updatedCandidate = await updateCandidate(id, result.data);

  await logAudit({
    userId: req.user?.id || null,
    action: "CANDIDATE_UPDATED",
    resource: "USER/CANDIDATE",
    metadata: { candidateId: id },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });
  res.json({ success: true, data: updatedCandidate });
});
