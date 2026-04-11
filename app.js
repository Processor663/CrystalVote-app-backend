import express from "express";  
import "dotenv/config"; 
import logger from "./src/lib/logger.js"; //  Winston logger
import  requestLogger from "./src/middlewares/requestLogger.js"; // Request Logger
import globalErrorHandler from "./src/middlewares/globalErrorHandler.js"; // Global error handler
import AppError from "./src/utils/appError.js"; // AppError class for custom error handling
import { StatusCodes } from "http-status-codes"; // HTTP status codes
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import auth  from "./src/lib/auth.js";
import { validateAuth } from "./src/middlewares/validateAuth.js"; // Validation middleware for auth routes
import dns from "node:dns"; // Set DNS servers for development environment to avoid potential DNS resolution issues
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}
const app = express();
const PORT = process.env.PORT || 3500; // Port configuration

// Middlewares
app.use(express.json()); 
app.use(validateAuth);
app.use(cookieParser());
app.use(requestLogger); // HTTP Request logging
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use("/api/auth", (req, _res, next)=> {
   console.log("Auth route hit:", req.method, req.url);
   next();
},toNodeHandler(auth)); // Mount BetterAuth BEFORE all other routes


// ROUTES
// app.use("/api/users", usersRouter);








// Catch-all for this router only
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND));
});

// Global error handling middleware (it should be defined after all routes and other middlewares)
app.use(globalErrorHandler);


let server; // store server reference

// start server function with DB connection
const serverStart = async () => {
  try {
    server = app.listen(PORT, () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`Server running on port ${PORT}`);
      }
      logger.info(`Server started on port: ${PORT}`, {
        env: process.env.NODE_ENV,
      });
    
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    logger.error("Failed to start server", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (code = 0) => {
  console.log("Shutting down server...");
  logger.info("Shutting down server...");

  // Safety net: force exit after 10 seconds
  const forceExit = setTimeout(() => {
    console.error("Force shutdown (timeout)");
    logger.error("Force shutdown triggered (timeout)");
    process.exit(1);
  }, 10000);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }

    await prisma.$disconnect();

    clearTimeout(forceExit); // cancel the force exit
    console.log("Shutdown complete");
    logger.info("Shutdown complete");
    process.exit(code);
  } catch (err) {
    console.error("Error during shutdown:", err.message);
    logger.error("Error during shutdown", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

// Process signals & errors
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown(1);
  logger.error("Unhandled Rejection", {
    error: err.message,
    stack: err.stack,
  });
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  logger.error("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });
  shutdown(1);
});

// Start the server
serverStart();