import { Router } from 'express';
import {verifyJWT} from "../middleware/auth.middleware.js"
import { verifyAdmin } from '../middleware/verifyadmin.middleware.js';
import { registerAsAdmin, deleteVideo, deleteComment, reviewReports, suspendUser } from '../controllers/admin.controller.js';
const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin);
router
.route("/")
.post(registerAsAdmin)

router
.route("/delete/comment/:commentId")
.delete(deleteComment);

router
.route("/delete/video/:videoId")
.delete(deleteVideo);

router
.route("/analyze")
.get(reviewReports)

router
.route("/suspend")
.post(suspendUser)


export default router