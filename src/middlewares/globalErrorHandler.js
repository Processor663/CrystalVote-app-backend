
// middlewares/globalErrorHandler.js
import { StatusCodes } from "http-status-codes";
import Prisma  from "../lib/prismaClient.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";

// ------------------- PRISMA ERROR HANDLERS -------------------

// Unique constraint violation 
const handlePrismaUniqueConstraint = (err) => {
  const fields = err.meta?.target?.join(", ") ?? "field";
  return new AppError(
    `Duplicate value on: ${fields}. Please use another value.`,
    StatusCodes.CONFLICT
  );
};

// Record not found 
const handlePrismaNotFound = (err) => {
  const model = err.meta?.modelName ?? "Record";
  return new AppError(`${model} not found.`, StatusCodes.NOT_FOUND);
};

// Foreign key constraint violation
const handlePrismaForeignKeyConstraint = (err) => {
  const field = err.meta?.field_name ?? "related record";
  return new AppError(
    `Related ${field} does not exist.`,
    StatusCodes.BAD_REQUEST
  );
};

// Required field missing or type mismatch
const handlePrismaValidationError = () =>
  new AppError(
    "Invalid input data. Please check your request.",
    StatusCodes.BAD_REQUEST
  );

// Database connection failure
const handlePrismaInitializationError = () =>
  new AppError(
    "Unable to connect to the database. Please try again later.",
    StatusCodes.SERVICE_UNAVAILABLE
  );

// Map Prisma known error codes to handlers
const handlePrismaKnownError = (err) => {
  switch (err.code) {
    case "P2002":
      return handlePrismaUniqueConstraint(err);
    case "P2025":
      return handlePrismaNotFound(err);
    case "P2003":
      return handlePrismaForeignKeyConstraint(err);
    case "P2000": // Value too long for column
    case "P2005": // Invalid value for field type
    case "P2006": // Invalid value for field
      return handlePrismaValidationError();
    default:
      return new AppError(
        "A database error occurred. Please try again.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
};

// ------------------- BETTER AUTH ERROR HANDLERS -------------------

const handleBetterAuthError = (err) => {
  const message = err.message ?? "Authentication error.";

  const statusMap = {
    UNAUTHORIZED: StatusCodes.UNAUTHORIZED,
    FORBIDDEN: StatusCodes.FORBIDDEN,
    USER_NOT_FOUND: StatusCodes.NOT_FOUND,
    SESSION_EXPIRED: StatusCodes.UNAUTHORIZED,
    INVALID_TOKEN: StatusCodes.UNAUTHORIZED,
    EMAIL_NOT_VERIFIED: StatusCodes.FORBIDDEN,
    ACCOUNT_DISABLED: StatusCodes.FORBIDDEN,
  };

  const statusCode =
    statusMap[err.code] ?? StatusCodes.UNAUTHORIZED;

  return new AppError(message, statusCode);
};

// ------------------- SEND ERROR -------------------

const logError = (err, req) => {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    statusCode: err.statusCode,
    isOperational: err.isOperational ?? false,
  });
};

const sendErrorDev = (err, req, res) => {
  logError(err, req);

  return res
    .status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
    .json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      error: err,
    });
};

const sendErrorProd = (err, req, res) => {
  logError(err, req);

  return res
    .status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
    .json({
      success: false,
      message: err.isOperational
        ? err.message
        : "Something went wrong. Please try again later.",
    });
};

// ------------------- GLOBAL ERROR HANDLER -------------------

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.isOperational = err.isOperational ?? false;

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  }

  // Clone to avoid mutating original error object
  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaKnownError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    error = handlePrismaValidationError();
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    error = handlePrismaInitializationError();
  }

  // BetterAuth errors
  else if (error.isBetterAuthError === true) {
    error = handleBetterAuthError(error);
  }

  return sendErrorProd(error, req, res);
};









