import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import {
  getCandidate,
  getAllCandidates,
} from "../services/candidate.service.js";

export const getCandidateController = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const candidates = await getCandidate(id);
  res.json({ success: true, data: candidates });
});

export const getAllCandidatesController = asyncHandler(async (req, res) => {
  const candidates = await getAllCandidates();
  res.json({ success: true, total: candidates.length, data: candidates });
});
