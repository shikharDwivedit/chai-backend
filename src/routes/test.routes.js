import { Router } from "express";
import { caching } from "../controllers/test.controller.js";

const router = new Router();

router.get("/cache",caching)

export default router