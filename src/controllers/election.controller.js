import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import {
  getElection,
  getAllElections,
  getElectionResults,
  createElection,
  updateElection,
  deleteElection,
} from "../services/election.service.js";
import {
  createElectionSchema,
  updateElectionSchema,
} from "../validators/election.validator.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";
import { logAudit } from "../services/audit.service.js";

export const getElectionController = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  if (!electionId || typeof electionId !== "string") {
    throw new AppError(
      "Election ID is required and must be a string",
      StatusCodes.BAD_REQUEST,
    );
  }
  const election = await getElection(electionId);

  res.status(StatusCodes.OK).json({ success: true, data: election });
});

export const getAllElectionsController = asyncHandler(async (req, res) => {
  const elections = await getAllElections();
  res
    .status(StatusCodes.OK)
    .json({ success: true, total: elections.length, data: elections });
});

export const createElectionController = asyncHandler(async (req, res) => {
  const result = createElectionSchema.safeParse(req.body);
  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten();
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages[0],
      ]),
    );

    const firstError =
      Object.values(formErrors)[0] ||
      Object.values(errors)[0] ||
      "Invalid input data. Please check your inputs and try again.";
    const errorMessage = firstError;

    logger.warn("Election validation failed", {
      errors,
      formErrors,
    });

    throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
  }

  const election = await createElection(result.data);
  logger.info(`Election created: ${election.id}`);

  await logAudit({
    userId: req.user?.id || null,
    action: "ELECTION_CREATED",
    resource: "ELECTION",
    metadata: { electionId: election.id },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });
  res.status(StatusCodes.CREATED).json({ success: true, data: election });
});

export const updateElectionController = asyncHandler(async (req, res) => {

  const result = updateElectionSchema.safeParse(req.body);
  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten();
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages[0],
      ]),
    );

    const firstError =
      Object.values(formErrors)[0] ||
      Object.values(errors)[0] ||
      "Invalid input data. Please check your inputs and try again.";
    const errorMessage = firstError;

    logger.warn("Update election validation failed", {
      errors,
      formErrors,
    });

    throw new AppError(errorMessage, StatusCodes.BAD_REQUEST);
  }

  const election = await updateElection(req.params.electionId, result.data);

  logger.info(`Election updated: ${election.id}`);

  await logAudit({
    userId: req.user?.id || null,
    action: "ELECTION_UPDATED",
    resource: "ELECTION",
    metadata: { electionId: election.id },
    ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.ip,
    userAgent: req.get("User-Agent") || null,
    requestId: req.id || null,
  });
  res.status(StatusCodes.OK).json({ success: true, data: election });
});

export const deleteElectionController = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  await deleteElection(electionId);
  logger.info(`Election deleted: ${electionId}`);
  res.status(StatusCodes.NO_CONTENT).json({ success: true });   
});

export const getElectionResultsController = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  if (!electionId || typeof electionId !== "string") {
    throw new AppError(
      "Election ID is required and must be a string",
      StatusCodes.BAD_REQUEST,
    );
  }
  const results = await getElectionResults(electionId);
  res.status(StatusCodes.OK).json({ success: true, data: results });                                          
})