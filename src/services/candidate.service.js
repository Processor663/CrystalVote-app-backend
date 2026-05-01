import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";

export const getCandidate = async (id) => {
  return await prisma.user.findUnique({
    where: { id, role: "CANDIDATE" },
    include: { candidate: true },
  });
};

export const getAllCandidates = async () => {
  return await prisma.user.findMany({
    where: { role: "CANDIDATE" },
    include: { candidate: true },
  });
};

export const updateCandidate = async (id, data) => {
  const { position, image, manifesto, ...userData } = data;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...userData,
    },
  });

  let updatedCandidate = {};
  if (position || image || manifesto) {
    updatedCandidate = await prisma.candidate.update({
      where: { userId: id },
      data: {
        position,
        image,
        manifesto,
      },
    });
  }
  return { ...updatedUser, candidate: updatedCandidate };
};
