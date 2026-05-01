import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import {
  getCandidatesByAdmin,
  createCandidateByAdmin,
  updateCandidateByAdmin,
  deleteCandidateByAdmin,
} from "../services/admin.candidate.service.js";
import {
  adminCreateCandidateSchema,
  adminUpdateCandidateSchema,
} from "../validators/candidate.validator.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";
import { logAudit } from "../services/audit.service.js";

export const getCandidates = asyncHandler(async (req, res) => {
  const candidates = await getCandidatesByAdmin();
  res.json({ success: true, total: candidates.length, data: candidates });
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

    const firstError =
      Object.values(formErrors)[0] ||
      Object.values(errors)[0] ||
      "Invalid input data. Please check your inputs and try again.";
    const errorMessage = firstError;

    logger.warn("Candidate validation failed", {
      errors,
      formErrors,
    });

    throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
  }

  const { candidate } = await createCandidateByAdmin(result.data);

  await logAudit({
    userId: req.user?.id || null,
    action: "CANDIDATE_CREATED",
    resource: "USER/CANDIDATE",
    metadata: { candidateId: candidate.id },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });
  res.status(StatusCodes.CREATED).json({ success: true, data: candidate });
});

export const updateCandidate = asyncHandler(async (req, res) => {
  if (!req.params || !req.params.id) {
    throw new AppError("Candidate ID is required", StatusCodes.BAD_REQUEST);
  }
  const { id } = req.params;
  const result = adminUpdateCandidateSchema.safeParse(req.body);

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

  const updatedCandidate = await updateCandidateByAdmin(id, result.data);

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

export const deleteCandidate = asyncHandler(async (req, res) => {
  if (!req.params || !req.params.id) {
    throw new AppError("Candidate ID is required", StatusCodes.BAD_REQUEST);
  }
  
  const { id } = req.params;
  const deletedCandidate = await deleteCandidateByAdmin(id);
  await logAudit({
    userId: req.user?.id || null,
    action: "CANDIDATE_DELETED",
    resource: "USER/CANDIDATE",
    metadata: { candidateId: id },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });
  res.json({
    success: true,
    message: "Candidate deleted successfully",
    data: deletedCandidate,
  });
});
