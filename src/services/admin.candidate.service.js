import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prisma";
import AppError from "../utils/appError";
import logger from "../lib/logger";

export const getCandidatesByAdmin = async () => {
  return await prisma.candidate.findMany({});
};

export const createCandidateByAdmin = async (data) => {
  const { name, email, password, nin, position } = data;

  let user = null;

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

    if (!user?.user?.id) {
      throw new AppError(
        "User creation failed",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        userId: user.user.id,
        position,
      },
    });

    return { ...user.user, candidate };
  } catch (error) {
    if (user?.user?.id) {
      await prisma.user
        .delete({
          where: { id: user.user.id },
        })
        .catch((deleteError) => {
          logger.error(
            "Rollback failed: could not delete user after candidate creation failure",
            {
              userId: user.user.id,
              error: deleteError.message,
            },
          );
          console.error("Rollback failed:", deleteError);
        });
    }
    throw error;
  }
};

export const updateCandidateByAdmin = async (id, data) => {
  return await prisma.candidate.update({
    where: { id },
    data: {
      ...data,
    },
  });
};

export const deleteCandidateByAdmin = async (id) => {
  return await prisma.candidate.delete({
    where: { id },
  });
};
