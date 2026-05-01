import express from "express";
const router = express.Router();
import {
 getUserController,
 getAllUsersController,
 updateUserController,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorize } from "../middlewares/authorize.js";

// middleware to protect all routes and restrict to admin role
router.use(requireAuth);

router.route("/").get(getAllUsersController);
router.route("/me").get(authorize(["USER"]), getUserController);
router.route("/me").patch(authorize(["USER"]), updateUserController);

export default router;
