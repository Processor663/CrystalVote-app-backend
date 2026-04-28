import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import {
  getCandidatesByAdmin,
  createCandidateByAdmin,
  // updateCandidateByAdmin,
  // deleteCandidateByAdmin,
} from "../services/admin.candidate.service.js";
import { adminCreateCandidateSchema } from "../validators/candidate.validator.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";
import { logAudit } from "../services/audit.service.js";



export const getCandidates = asyncHandler(async (req, res) => {
  const candidates = await getCandidatesByAdmin();
  res.json({ success: true, data: candidates });
});

export const createCandidate = asyncHandler(async (req, res) => {
  const result = adminCreateCandidateSchema.safeParse(req.body);

  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten();
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages[0],
      ]),
    );

    const firstError = Object.entries(errors)[0];
    const errorMessage = firstError;

    logger.warn("Candidate validation failed", {
      errors,
      formErrors,
    });

    throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
  }

  const candidate = await createCandidateByAdmin(result.data);
  if (!candidate) {
    logger.error("Candidate creation failed", {
      fields: Object.keys(result.data),
    });

    throw new AppError(
      "Candidate creation failed",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
  logAudit({
    userId: req.user?.id || null,
    action: "CANDIDATE_CREATED",
    metadata: { candidateId: candidate.id },
    ipAddress: req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });
  res.status(StatusCodes.CREATED).json({ success: true, data: candidate });
});
