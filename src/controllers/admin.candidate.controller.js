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
import logger  from "../lib/logger.js";
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

     throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
     logger.error("Candidate creation failed", {
       errors,
       formErrors,
     }); 
  }
 
  const candidate = await createCandidateByAdmin(data);
  if (!candidate) {
    throw new AppError("Candidate creation failed", StatusCodes.INTERNAL_SERVER_ERROR);
  } 
  res.status(StatusCodes.CREATED).json({ success: true, data: candidate });
});
