import express from "express";
const router = express.Router();
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/admin.candidate.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorize } from "../middlewares/authorize.js";

// middleware to protect all routes and restrict to admin role
router.use(requireAuth, authorize(["SUPER_ADMIN", "ADMIN"]));

router.route("/").get(getCandidates).post(createCandidate);
router.route("/:id").patch(updateCandidate).delete(deleteCandidate);

export default router;
