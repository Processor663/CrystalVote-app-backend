import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";

export const getMyVote = async (userId) => {
  return await prisma.vote.findUnique({
    where: { voterId: userId },
    include: {
      candidate: true,
    },
  });
};

export const getResults = async (electionId) => {
  const votes = await prisma.vote.findMany({
    where: { electionId },
    include: {
      user: {
        include: {
          candidate: true,
        },
      },
    },
  });
};

// GET     /api/v1/votes/my-vote
// GET     /api/v1/votes/results
// GET     /api/v1/votes/results/live
// GET     /api/v1/votes/results/:electionId
// POST    /api/v1/votes/cast
