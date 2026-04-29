import express from "express";
const router = express.Router();
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/admin.candidate.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";


router.use(requireAuth);  
router
  .route("/")
  .get(getCandidates)
  .post(createCandidate)

router
  .route("/:id")
  .patch(updateCandidate)
  .delete(deleteCandidate); 

export default router;
