import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import {
    getElection,
    getAllElections,
    createElection,
    updateElection,
    deleteElection, 
} from "../services/election.service.js";
import { updateCandidateSchema } from "../validators/candidate.validator.js";
import AppError from "../utils/appError.js";
import logger from "../lib/logger.js";
import { logAudit } from "../services/audit.service.js";
