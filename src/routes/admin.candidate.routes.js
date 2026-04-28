import express from "express";
const router = express.Router();
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/admin.candidate.controller.js";

router
  .route("/")
  .get(getCandidates)
  .post(createCandidate)

router
  .route("/:id")
  .patch(updateCandidate)
  .delete(deleteCandidate); 

export default router;
