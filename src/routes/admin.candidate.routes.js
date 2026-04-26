import express from "express";
const router = express.Router();
import {
  getCandidates,
  createCandidate,
} from "../controllers/admin.candidate.controller.js";


router.route("/").get(getCandidates).post(createCandidate);

export default router;  