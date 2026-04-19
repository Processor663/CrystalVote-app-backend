import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";


// You have to delete auditLog manually, Run daily — deletes logs older than 90 days, Wrap in a function and schedule it
export const cleanOldAuditLogs = async () => {
  try {
    const deleted = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    });
    logger.info(`Audit log cleanup: deleted ${deleted.count} old records`);
  } catch (error) {
    logger.error("Audit log cleanup failed", { error: error.message }); // ✅ logs and moves on, never crashes
  }
};

const logAudit = async ({
  userId,
  action,
  ipAddress,
  userAgent,
  metadata = {},
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null, // Allow null for unauthenticated actions
        action,
        ipAddress: ipAddress || "N/A",
        userAgent: userAgent || "N/A",
        metadata,
      },
    });

    logger.info("Audit event recorded", { userId, action });
  } catch (error) {
    logger.error("Audit log failed", {
      error: error.message,
      action,
      userId: userId || "N/A",
    });
  }
};

export  { logAudit };


