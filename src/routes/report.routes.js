import { Router } from "express";   
import { reportComment,reportVideo } from "../controllers/report.controller.js";
import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT)
router.post("/video/:videoId", reportVideo);
router.post("/comment/:commentId", reportComment);

export default router;