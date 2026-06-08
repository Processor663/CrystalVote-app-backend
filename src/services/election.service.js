import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";

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
