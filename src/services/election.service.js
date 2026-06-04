import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";

export const getElection = async (id) => {
  return await prisma.election.findUnique({
    where: { id },
  });
};

export const getAllElections = async () => {
  return await prisma.election.findMany();
};

export const createElection = async (data) => {
  const newElection = await prisma.election.create({
    data: {
      ...data,
    },
  });

  return { ...newElection };
};

export const updateElection = async (id, data) => {
  const updatedElection = await prisma.election.update({
    where: { id },
    data: {
      ...data,
    },
  });

  return { ...updatedElection };
};

export const deleteElection = async (id) => {
  await prisma.election.delete({
    where: { id },
  });
};
