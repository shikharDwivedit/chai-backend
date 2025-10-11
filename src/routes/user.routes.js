import { Router } from "express";
import { ChangePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshTokens, registerUser, updateUserDetails } from "../controllers/user.controller.js";
import {upload} from '../middleware/multer.middleware.js'
import { verifyJWT } from "../middleware/auth.middleware.js";
import { updateUserAvatar, updateUserCoverImage } from "../controllers/file.controller.js";

const router = Router()

router.route("/register").post(
    //This middleware will run before registerUser
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),

    registerUser
)

router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshTokens").post(refreshTokens)

router.route("/changepassword").post(verifyJWT,ChangePassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/updatedetails").patch(verifyJWT, updateUserDetails)
router.route("/avatarUpdate").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)
router.route("/CoverUpdate").patch(verifyJWT, upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;