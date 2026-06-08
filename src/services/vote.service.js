import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";

// Get all votes cast by the user in a specific election
export const getMyVotes = async (userId, electionId) => {
  return await prisma.vote.findMany({
    where: { voterId: userId, electionId },
    include: {
      candidate: true,
    },
  });
};

// cast a vote for a candidate in an election
export const castVote = async (userId, electionId, candidateId) => {
  const [election, candidate] = await Promise.all([
    prisma.election.findUnique({
      where: { id: electionId },
    }),
    prisma.candidate.findUnique({
      where: { id: candidateId },
    }),
  ]);

  // Check if election exists
  if (!election) {
    throw new AppError("Election not found", StatusCodes.NOT_FOUND);
  }

  // Check if election is ongoing
  if (election.status !== "ONGOING") {
    throw new AppError(
      "Cannot cast vote, election is not ongoing",
      StatusCodes.BAD_REQUEST,
    );
  }

  // Check if candidate exists
  if (!candidate) {
    throw new AppError("Candidate not found", StatusCodes.NOT_FOUND);
  }

  // Check if user already voted for this position in this election
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
      `You have already voted for a ${candidate.position} in this election`,
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
    include: {
      candidate: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      election: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  return vote;
};

// Update an existing vote in the same election
export const updateVote = async (userId, voteId, newCandidateId) => {

  const existingVote = await prisma.vote.findUnique({
    where: { id: voteId },
    include: {
      candidate: true,
      election: true,
    },
  });

  // Check if vote exists
  if (!existingVote) {
    throw new AppError("Vote not found", StatusCodes.NOT_FOUND);
  }

  // Check if the vote belongs to the user
  if (existingVote.voterId !== userId) {
    throw new AppError(
      "You are not authorized to update this vote",
      StatusCodes.FORBIDDEN,
    );
  }

  // Check if the election is still ongoing
  if (existingVote.election.status !== "ONGOING") {
    throw new AppError(
      "Cannot update vote, election is not ongoing",
      StatusCodes.BAD_REQUEST,
    );
  }

  // Check if new candidate is the same as the current one
  if (existingVote.candidateId === newCandidateId) {
    throw new AppError(
      "New candidate must be different from the current one",
      StatusCodes.BAD_REQUEST,
    );
  }

  // Fetch the new candidate
  const newCandidate = await prisma.candidate.findUnique({
    where: { id: newCandidateId },
  });

  // Check if new candidate exists
  if (!newCandidate) {
    throw new AppError("Candidate not found", StatusCodes.NOT_FOUND);
  }

  // Check if new candidate belongs to the same election
  if (newCandidate.electionId !== existingVote.electionId) {
    throw new AppError(
      "Candidate does not belong to this election",
      StatusCodes.BAD_REQUEST,
    );
  }

  // Check if new candidate is for the same position
  if (newCandidate.position !== existingVote.candidate.position) {
    throw new AppError(
      `You can only switch to another ${existingVote.candidate.position} candidate`,
      StatusCodes.BAD_REQUEST,
    );
  }

  // Update the vote
  const updatedVote = await prisma.vote.update({
    where: { id: voteId },
    data: {
      candidateId: newCandidateId,
    },
    include: {
      candidate: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      election: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  return updatedVote;
};

// GET     /api/v1/votes/my-vote
// GET     /api/v1/votes/results
// GET     /api/v1/votes/results/live
// GET     /api/v1/votes/results/:electionId
// POST    /api/v1/votes/cast
// PATCH   /api/v1/votes/update
