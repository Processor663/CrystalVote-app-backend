import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prismaClient.js";
import { sendEmail } from "./sendEmail.js";
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
} from "../templates/emailTemplates.js";
import "dotenv/config";
import logger from "./logger.js";
import { logAudit } from "../services/audit.service.js";

const APP_NAME = process.env.APP_NAME || "crystal-vote app";

const auth = betterAuth({
  // ════════════════════════════════════════
  // 1. CORE CONFIG
  // ════════════════════════════════════════
  appName: APP_NAME,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.FRONTEND_URL],

  // ════════════════════════════════════════
  // 2. EMAIL AND PASSWORD
  // ════════════════════════════════════════
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      console.log(
        `Password reset requested for ${user.email}, token: ${token}`,
      );
      void sendEmail({
        to: user.email,
        subject: `Reset your ${APP_NAME} password`,
        html: passwordResetEmailTemplate({
          name: user.name,
          url,
          appName: APP_NAME,
        }),
      });
    },
    resetPasswordTokenExpiresIn: 3600, // token valid for 1 hour
    onPasswordReset: async ({ user }) => {
      logger.info(`Password reset for user ${user.email}`);

      //audit log for password resets
      await logAudit({
        userId: user.id,
        action: "PASSWORD_RESET",
        metadata: { email: user.email },
      });
    },
  },

  // ════════════════════════════════════════
  // 3. EMAIL VERIFICATION
  // ════════════════════════════════════════
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url }) => {
      // void = don't await — prevents timing attacks
      void sendEmail({
        to: user.email,
        subject: `Verify your ${APP_NAME} email address`,
        html: verificationEmailTemplate({
          name: user.name,
          url,
          appName: APP_NAME,
        }),
      });
    },
  },

  // ════════════════════════════════════════
  // 4. USER ADDITIONAL FIELDS
  // ════════════════════════════════════════
  user: {
    additionalFields: {
      nin: {
        type: "string",
        required: true,
        input: true,
      },
      role: {
        type: "string",
        input: false,
      },
    },
  },

  // ════════════════════════════════════════
  // 5. SOCIAL PROVIDERS (commented out)
  // ════════════════════════════════════════

  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   },
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET,
  //   },
  // },

  // ════════════════════════════════════════
  // 6. SESSION
  // ════════════════════════════════════════
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // cache 5 minutes
    },
  },

  // ════════════════════════════════════════
  // 7. DATABASE HOOKS
  // ════════════════════════════════════════
  databaseHooks: {
    user: {
      create: {
        // Fires after a new user is successfully registered
        after: async (user) => {
          await logAudit({
            userId: user.id,
            action: "USER_REGISTERED",
            metadata: { email: user.email },
          });
        },
      },

      // update: {
      //   // Fires after a user record is updated
      //   // This covers password resets since they update the user record
      //   after: async (user) => {
      //     await logAudit({
      //       userId: user.id,
      //       action: "PASSWORD_RESET",
      //       metadata: { email: user.email },
      //     });
      //   },
      // },
    },

    session: {
      create: {
        // Fires after a session is created = user just logged in
        after: async (session) => {
          await logAudit({
            userId: session.userId,
            action: "USER_LOGIN",
            metadata: { sessionId: session.id },
          });
        },
      },

      delete: {
        // Fires after a session is deleted = user just logged out
        after: async (session) => {
          await logAudit({
            userId: session.userId,
            action: "USER_LOGOUT",
            metadata: { sessionId: session.id },
          });
        },
      },
    },
  },

  // ════════════════════════════════════════
  // 8. ERROR HANDLING — always last
  // ════════════════════════════════════════
  onAPIError: {
    onError: (error, ctx) => {
      void logAudit({
        action: "AUTH_ERROR",
        userAgent: ctx.request?.headers?.get("user-agent"),
        ipAddress:
          ctx.request?.headers?.get("x-forwarded-for") ??
          ctx.request?.headers?.get("x-real-ip") ??
          null,
        requestId: ctx.request?.headers?.get("x-request-id") ?? null,
        metadata: {
          error: error.message,
          path: ctx.request?.url,
        },
      });
    },
  },
});

export default auth;
