import prisma from "../lib/prisma";


export const getCandidates = async () => {
  return await prisma.candidate.findMany({});
};

export const createCandidate = async (data) => {
    return await prisma.candidate.create({
    data: {
      ...data,
    },
  });
};

export const updateCandidate = async (id, data) => {
  return await prisma.candidate.update({
    where: { id },
    data: {
      ...data,
    },
  });
};

export const deleteCandidate = async (id) => {
  return await prisma.candidate.delete({
    where: { id },
  });
};


