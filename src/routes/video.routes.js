import { Router } from "express";
import { publishAVideo,updateVideo, deleteVideo, togglePublishStatus,getAllVideos, getVideoById, cloudinaryWebHookHandler } from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { generateUploadSignature } from "../services/video.signature.js";
import { verifyCloudinaryWebhook } from "../middleware/verifyCloudinaryWebhook.middleware.js";

const router = Router();
import express from "express";

router.post(
  "/cloudinary",
  express.raw({ type: "*/*" }),
  verifyCloudinaryWebhook,
  cloudinaryWebHookHandler
);

router.use(verifyJWT);
router
.route("/:videoId")
.get(getVideoById)

router
.route("/")
.get(getAllVideos)
.post(
    generateUploadSignature
);


router
    .route("/:videoId")
    .delete(deleteVideo)
    .patch(updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
