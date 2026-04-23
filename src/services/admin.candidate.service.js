import prisma from "../lib/prisma";


export const getCandidatesByAdmin = async () => {
  return await prisma.candidate.findMany({});
};

export const createCandidateByAdmin = async (data) => {
   return await prisma.$transaction(async (tx) => {
     // Create User
     const user = await tx.user.create({
       data: {
         email,
         password,
         role: "CANDIDATE",
       },
     });

     // Create Candidate
     const candidate = await tx.candidate.create({
       data: {
         userId: user.id,
         position,
       },
     });

     return { user, candidate };
   });
};






module.exports = {
  createCandidateService,
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


