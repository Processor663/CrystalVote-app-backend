import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";
import auth from "../lib/auth.js";

export const getCandidatesByAdmin = async () => {
  return await prisma.candidate.findMany({});
};

export const createCandidateByAdmin = async (data) => {
  const { name, email, password, nin, position } = data;

  let user = null;
  let dbUser = null;

  try {
    user = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        nin,
        role: "CANDIDATE",
      },
    });

    dbUser = await prisma.user.findUnique({
      where: { id: user.user.id },
    });

    if (!dbUser) {
      throw new AppError(
        "User creation failed... Please try again.",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
    const candidate = await prisma.candidate.create({
      data: {
        userId: dbUser.id,
        position,
      },
    });

    return { ...dbUser, candidate };
  } catch (error) {
    if (dbUser?.id) {
      await prisma.user
        .delete({
          where: { id: dbUser.id },
        })
        .catch((deleteError) => {
          logger.error(
            "Rollback failed: could not delete user after candidate creation failure",
            {
              userId: dbUser.id,
              error: deleteError.message,
            },
          );
        });
    }
    throw error;
  }
};

export const updateCandidateByAdmin = async (id, data) => {
  const { position, ...userData } = data;
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...userData,
    },
  });

  let updatedCandidate = {};
  if (position) {
    updatedCandidate = await prisma.candidate.update({
      where: { userId: id },
      data: {
        position,
      },
    });
  }
  return { ...updatedUser, candidate: updatedCandidate };
};

export const deleteCandidateByAdmin = async (id) => {
  return await prisma.candidate.delete({
    where: { id },
  });
};
