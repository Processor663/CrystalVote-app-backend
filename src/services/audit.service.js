import prisma from "../lib/prismaClient.js";
import logger from "../lib/logger.js";

// You have to delete auditLog manually, Run daily — deletes logs older than 90 days, Wrap in a function and schedule it
export const cleanOldAuditLogs = async (batchSize = 1000) => {
  let totalDeleted = 0;
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  try {
    while (true) {
      const batch = await prisma.auditLog.findMany({
        where: { createdAt: { lt: cutoff } },
        select: { id: true },
        take: batchSize,
      });

      if (batch.length === 0) break;

      const { count } = await prisma.auditLog.deleteMany({
        where: { id: { in: batch.map((r) => r.id) } },
      });

      totalDeleted += count;
    }

    logger.info(`Audit log cleanup: deleted ${totalDeleted} old records`);
  } catch (error) {
    logger.error("Audit log cleanup failed", { error: error.message });
  }
};


const logAudit = async ({
  userId,
  resource,
  action,
  ipAddress,
  userAgent,
  requestId,
  metadata = {},
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null, // Allow null for unauthenticated actions
        action,
        resource: resource || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        requestId: requestId || null,
        metadata,
      },
    });

    if (!action) {
      logger.warn("logAudit called without action", { userId });
      return;
    }

    logger.info("Audit event recorded", { userId, action });
  } catch (error) {
    logger.error("Audit log failed", {
      error: error.message,
      action,
      requestId: requestId || null,
      userId:  userId ?? "unauthenticated",
    });
  }
};

export  { logAudit };


