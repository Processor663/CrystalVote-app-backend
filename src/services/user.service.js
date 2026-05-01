import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";

export const getUser = async (id) => {
  return await prisma.user.findUnique({
    where: { id, role: "USER" },
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: { role: "USER" },
  
  });
};

export const updateUser = async (id, data) => {
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...data,
    },
  });

  return { ...updatedUser };
};
