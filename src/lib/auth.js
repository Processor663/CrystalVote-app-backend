import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prismaClient.js";
import { z } from "zod";
import "dotenv/config"; 
// import nodemailer from "nodemailer";



// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    requireEmailVerification: false,
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

  // emailVerification: {
  // sendOnSignUp: true,
  // autoSignInAfterVerification: true,
  // sendVerificationEmail: async ({ user, url }) => {
  //   await transporter.sendMail({
  //     from: `"My App" <no-reply@yourdomain.com>`,
  //     to: user.email,
  //     subject: "Verify your email",
  //     html: `<a href="${url}">Click here to verify your email</a>`,
  //   });
  // },
  // },

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