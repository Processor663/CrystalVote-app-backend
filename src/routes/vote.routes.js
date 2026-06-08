import express from "express";
const router = express.Router();
import {
    getMyVotesController,
    castVoteController,
    updateVoteController
} from "../controllers/vote.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorize } from "../middlewares/authorize.js";

// only authenticated user and candidate can access these routes
router.use(requireAuth, authorize(["USER", "CANDIDATE"])); 

router.route("/my-vote/:electionId").get( getMyVotesController);
router.route("/cast/:electionId").post(castVoteController);
router.route("/update/:electionId").patch( updateVoteController);





