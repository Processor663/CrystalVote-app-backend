import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import {
  getCandidatesByAdmin,
  createCandidateByAdmin,
  updateCandidateByAdmin,
  deleteCandidateByAdmin,
} from "../services/admin.candidate.service.js";
import { createCandidateSchema } from "../validators/candidate.validator.js";
import AppError from "../utils/appError.js";  





export const getCandidates = asyncHandler(async (req, res) => {
  const candidates = await getCandidatesByAdmin();
  res.json({ success: true, data: candidates });
});

export const createCandidate = asyncHandler(async (req, res) => {
    const { error, data } = createCandidateSchema.safeParse(req.body);
    if (error) {
      throw new AppError("Invalid user data provided", StatusCodes.BAD_REQUEST);
    }

  const candidate = await createCandidateByAdmin(data);
  if (!candidate) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "Failed to create candidate" });
  } 
  res.status(StatusCodes.CREATED).json({ success: true, message: "Candidate created successfully", data: candidate });
});
