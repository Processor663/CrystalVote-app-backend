import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { getCandidates, createCandidate } from "../services/candidate.service.js";


export const getCandidates = asyncHandler(async (req, res) => {
  const candidates = await getCandidates();
  res.json({ success: true, data: candidates });
});

export const createCandidate = asyncHandler(async (req, res) => {
  const candidate = await createCandidate(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: candidate });
});    