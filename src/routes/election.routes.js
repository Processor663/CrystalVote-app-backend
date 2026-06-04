import express from "express";
const router = express.Router();
import {
  createElectionController,
  getElectionController,
  getAllElectionsController,
  updateElectionController,
  deleteElectionController,
} from "../controllers/election.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorize } from "../middlewares/authorize.js";


// middleware to protect all routes and restrict to admin role
router.use(requireAuth, authorize(["SUPER_ADMIN", "ADMIN"]));


router.route("/").get(getAllElectionsController);
router.route("/:id").get(getElectionController);
router.route("/").post(createElectionController);
router.route("/:id").patch(updateElectionController);
router.route("/:id").delete(deleteElectionController);

export default router;