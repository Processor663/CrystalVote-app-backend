import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { getMyVotes, castVote, updateVote } from "../services/vote.service.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";
import { logAudit } from "../services/audit.service.js";

export const getMyVotesController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { electionId } = req.params;

  if (!electionId || typeof electionId !== "string") {
    throw new AppError(
      "Election ID is required and must be a string",
      StatusCodes.BAD_REQUEST,
    );
  }
  const votes = await getMyVotes(userId, electionId);

  res
    .status(StatusCodes.OK)
    .json({ success: true, total: votes.length, data: votes });
});

export const castVoteController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { electionId } = req.params;
  const { candidateId } = req.body;

  if (!electionId || typeof electionId !== "string") {

    logger.warn("Invalid election ID provided for casting vote", {
      electionId,
    });

    throw new AppError(
      "Election ID is required and must be a string",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!candidateId || typeof candidateId !== "string") {
    logger.warn("Invalid candidate ID provided for casting vote", {
      candidateId,
    });

    throw new AppError(
      "Candidate ID is required and must be a string",
      StatusCodes.BAD_REQUEST,
    );
  }

  const vote = await castVote(userId, electionId, candidateId);

  logger.info(`User ${userId} cast a vote for candidate ${candidateId} in election ${electionId}`);

  await logAudit({
    userId: req.user?.id || null,
    action: "VOTE_CAST",
    resource: "VOTE",
    metadata: { electionId, candidateId },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: vote });
});

export const updateVoteController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { voteId } = req.params;
  const { candidateId } = req.body;

  if (!voteId || typeof voteId !== "string") {
    logger.warn("Invalid vote ID provided for updating vote", {
      voteId,
    });

    throw new AppError(
      "Vote ID is required and must be a string",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!candidateId || typeof candidateId !== "string") {
    logger.warn("Invalid candidate ID provided for updating vote", {
      candidateId,
    });

    throw new AppError(
      "Candidate ID is required and must be a string",
      StatusCodes.BAD_REQUEST,
    );
  }

  const vote = await updateVote(userId, voteId, candidateId);

  logger.info(`User ${userId} updated their vote to candidate ${candidateId} in election ${electionId}`);

  await logAudit({
    userId: req.user?.id || null,
    action: "VOTE_UPDATED",
    resource: "VOTE",
    metadata: { electionId, candidateId },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });

  res.status(StatusCodes.OK).json({ success: true, data: vote });
});

