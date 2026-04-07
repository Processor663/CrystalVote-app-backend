import { success } from "zod";
import  auth from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { StatusCodes } from "http-status-codes";  

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(StatusCodes.UNAUTHORIZED).json({success: false, message: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({success: false, message: "Invalid session" });
  }
}
