import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";

export const getMyVotes = async (userId, electionId) => {
  return await prisma.vote.findMany({
    where: { voterId: userId, electionId },
    include: {
      candidate: true,
    },
  });
};

export const castVote = async (userId, electionId, candidateId) => {
  // Check if the election exists
  const election = await prisma.election.findUnique({
    where: { id: electionId },
  });

  if (!election) {
    throw new AppError("Election not found", StatusCodes.NOT_FOUND);
  }

  // Check if the election is ongoing
  if (election.status !== "ONGOING") {
    throw new AppError("Election is not ongoing", StatusCodes.BAD_REQUEST);
  }

  // Check if the candidate belongs to this election
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, electionId },
  });

  if (!candidate) {
    throw new AppError(
      "Candidate not found in this election",
      StatusCodes.NOT_FOUND,
    );
  }

  // Check if user has already voted in this election (regardless of candidate)
  const existingVote = await prisma.vote.findFirst({
    where: {
      voterId: userId,
      electionId,
      candidate: {
        position: candidate.position,
      },
    },
  });

  if (existingVote) {
    throw new AppError(
      "You have already voted in this election",
      StatusCodes.BAD_REQUEST,
    );
  }

  // Cast the vote
  const vote = await prisma.vote.create({
    data: {
      voterId: userId,
      electionId,
      candidateId,
    },
  });

  return vote;
};

// GET     /api/v1/votes/my-vote
// GET     /api/v1/votes/results
// GET     /api/v1/votes/results/live
// GET     /api/v1/votes/results/:electionId
// POST    /api/v1/votes/cast
// PATCH   /api/v1/votes/update
