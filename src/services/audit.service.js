// const AuditLogModel = require("../models/auditLog.model");
// const logger = require("../config/logger");


//claude: you have to delete auditLog manuelly
// Run daily — deletes logs older than 90 days
// await prisma.auditLog.deleteMany({
//   where: {
//     createdAt: {
//       lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
//     }
//   }
// })

// const logAudit = async ({
//   userId,
//   action,
//   ipAddress,
//   userAgent,
//   metadata = {},
// }) => {
//   try {
//     await AuditLogModel.create({
//       userId: userId || null, // Allow null for unauthenticated actions
//       action,
//       ipAddress: ipAddress || "N/A",
//       userAgent: userAgent || "N/A",
//       metadata,
//     });

//     logger.info("Audit event recorded", { userId, action });
//   } catch (error) {
//     logger.error("Audit log failed", {
//       error: error.message,
//       action,
//       userId: userId || "N/A",
//     });
//   }
// };

// module.exports = { logAudit };


