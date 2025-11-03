import { Router } from 'express';
import {verifyJWT} from "../middleware/auth.middleware.js"
import { verifyAdmin } from '../middleware/verifyadmin.middleware.js';
import { registerAsAdmin, deleteVideo, deleteComment } from '../controllers/admin.controller.js';
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



export default router