import prisma from "../lib/prismaClient.js";
import AppError from "../utils/appError.js";
import { StatusCodes } from "http-status-codes";
import { CandidatePosition } from "../generated/prisma/index.js";

export const getElection = async (electionId) => {
  return await prisma.election.findUnique({
    where: { id: electionId },
  });
};

export const getAllElections = async () => {
  return await prisma.election.findMany();
};

export const createElection = async (electionData) => {
  const newElection = await prisma.election.create({
    data: {
      ...electionData,
    },
  });

  return { ...newElection };
};

export const updateElection = async (electionId, electionData) => {
  const updatedElection = await prisma.election.update({
    where: { id: electionId },
    data: {
      ...electionData,
    },
  });

  return { ...updatedElection };
};

export const deleteElection = async (electionId) => {
  await prisma.election.delete({
    where: { id: electionId },
  });
};

// Have not cross-checked this code.
export const getElectionResults = async (electionId) => {
  // Fetch election with all candidates and their vote counts
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: {
      candidates: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  if (!election) {
    throw new AppError("No ongoing election", StatusCodes.NOT_FOUND);
  }

  // Get total votes in this election
  const totalVotes = await prisma.vote.count({
    where: { electionId },
  });

  // Group candidates by position, calculate percentages, detect draws
  const resultsByPosition = Object.values(CandidatePosition).reduce(
    (acc, position) => {
      const candidates = election.candidates
        .filter((c) => c.position === position)
        .map((c) => ({
          id: c.id,
          name: c.user.name,
          email: c.user.email,
          image: c.image,
          position: c.position,
          votes: c._count.votes,
        }))
        .sort((a, b) => b.votes - a.votes); // highest votes first

      if (candidates.length > 0) {
        // Calculate percentage per position (not total election votes)
        const positionTotalVotes = candidates.reduce(
          (sum, c) => sum + c.votes,
          0,
        );

        const candidatesWithPercentage = candidates.map((c) => ({
          ...c,
          percentage:
            positionTotalVotes > 0
              ? ((c.votes / positionTotalVotes) * 100).toFixed(2) + "%"
              : "0%",
        }));

        // Detect draw
        const topVotes = candidatesWithPercentage[0].votes;
        const winners = candidatesWithPercentage.filter(
          (c) => c.votes === topVotes,
        );

        acc[position] = {
          candidates: candidatesWithPercentage,
          totalPositionVotes: positionTotalVotes,
          isDraw: winners.length > 1,
          winner: winners.length === 1 ? candidatesWithPercentage[0] : null,
          drawBetween: winners.length > 1 ? winners.map((c) => c.name) : null,
        };
      }

      return acc;
    },
    {},
  );

  return {
    election: {
      id: election.id,
      title: election.title,
      description: election.description,
      status: election.status,
      startDate: election.startDate,
      endDate: election.endDate,
    },
    totalVotes,
    results: resultsByPosition,
  };
};