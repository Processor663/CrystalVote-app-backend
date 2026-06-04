import express from "express";
const router = express.Router();
import {
  getAllCandidatesController,
  getCandidateController,
  updateCandidateController,
} from "../controllers/candidate.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorize } from "../middlewares/authorize.js";

// middleware to protect all routes and restrict to admin role
router.use(requireAuth);

router.route("/").get(getAllCandidatesController);
router.route("/me").get(authorize(["CANDIDATE"]), getCandidateController);
router.route("/me").patch(authorize(["CANDIDATE"]), updateCandidateController);

export default router;
