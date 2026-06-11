import "dotenv/config";
import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";
import AppError from "../utils/appError.js";
import auth from "../lib/auth.js";



const seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });

    if (existingAdmin) {
      logger.info("Admin already exists. Skipping seeding.");
      return;
    }

    const { user: createdUser } = await auth.api.signUpEmail({
      body: {
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        nin: `ADMIN-${Date.now()}`,
      },
    });

    if (!createdUser?.id) {
      throw new Error("User creation failed");
    }

    await prisma.user.update({
      where: { id: createdUser.id },
      data: {
        role: "SUPER_ADMIN",
        isVerified: true,
      },
    });

    logger.info(`SUPER_ADMIN seeded successfully: ${process.env.ADMIN_EMAIL}`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding SUPER_ADMIN: " + error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

seedAdmin();
