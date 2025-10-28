import { Router } from 'express';
import {verifyJWT} from "../middleware/auth.middleware.js"
import { verifyAdmin } from '../middleware/verifyadmin.middleware.js';
import { registerAsAdmin } from '../controllers/admin.controller.js';
const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin);
router
.route("/")
.post(registerAsAdmin)
.delete()

export default router