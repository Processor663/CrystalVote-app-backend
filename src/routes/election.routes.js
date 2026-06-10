import express from "express";
const router = express.Router();
import {
  createElectionController,
  getElectionController,
  getAllElectionsController,
  updateElectionController,
  deleteElectionController,
  getElectionResultsController
} from "../controllers/election.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorize } from "../middlewares/authorize.js";


// middleware to protect all routes and restrict to admin role
router.use(requireAuth, authorize(["SUPER_ADMIN", "ADMIN"]));


router.route("/").get(getAllElectionsController);
router.route("/:electionId").get(getElectionController);
router.route("/").post(createElectionController);
router.route("/:electionId").patch(updateElectionController);
router.route("/:electionId").delete(deleteElectionController);
router.route("/:electionId/results").get(getElectionResultsController);

export default router;