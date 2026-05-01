import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";



export const getCandidate = async (id) => {
  return await prisma.user.findUnique({
    where: { id , role: "CANDIDATE" },
    include: { candidate: true },
  });
}   

export const getAllCandidates = async () => {
  return await prisma.user.findMany({
    where: { role: "CANDIDATE" },
    include: { candidate: true },
  });
}   