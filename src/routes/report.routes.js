import { Router } from "express";   
import { reportObjects } from "../controllers/report.controller.js";
import  verify  from "jsonwebtoken";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT)
router.post("/target/", reportObjects);

export default router;