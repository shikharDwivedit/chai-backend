import { Router } from "express";
import { publishAVideo,updateVideo, deleteVideo, togglePublishStatus,getAllVideos } from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router
.route("/")
.get(getAllVideos)
.post(
    upload.fields([
        { name: "videofile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
);


router
    .route("/:videoId")
    .delete(deleteVideo)
    .patch(upload.fields([
            { name: "videofile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 }
        ]),
        updateVideo
    );

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
