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

const APP_NAME = process.env.APP_NAME || "crystal-vote app";

const auth = betterAuth({
  appName: APP_NAME,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url , token}) => {
      console.log(`Password reset requested for ${user.email}, token: ${token}`);
      // void = don't await — prevents timing attacks
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

    //remember to add audit logs for security-sensitive actions like password resets
    onPasswordReset: async ({ user }) => {
      logger.info(`Password reset for user ${user.email}`);
    },
  },
  user: {
    additionalFields: {
      nin: {
        type: "string",
        required: true, // ← set false if optional
        input: true, // ← accept it from the sign-up request body
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true, // send verification email on sign up
    sendOnSignIn: true, // resend if user tries to sign in unverified
    autoSignInAfterVerification: true, // auto sign in after email is verified
    expiresIn: 3600, // token expires in 1 hour

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

  // socialProviders: {
  // google: {
  //   clientId: process.env.GOOGLE_CLIENT_ID,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // },
  // github: {
  //   clientId: process.env.GITHUB_CLIENT_ID,
  //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
  // },
  // },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache 5 minutes
    },
  },

  trustedOrigins: [process.env.FRONTEND_URL],
  secret: process.env.BETTER_AUTH_SECRET,
});

export default auth;
