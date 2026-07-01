import crypto from "crypto";
import cloudinary from "../utils/cloudinary.js";
const verifyCloudinaryWebhook = (req, res, next) => {
    try {
        const signature = req.headers["x-cld-signature"];
        const timestamp = req.headers["x-cld-timestamp"];

        if (!signature || !timestamp) {
            return res.status(401).json({
                success: false,
                message: "Missing Cloudinary signature headers"
            });
        }
        // making sure the raw body remain same not parsed
        const rawBody = req.body.toString("utf8");

        const isValid = cloudinary.utils.verifyNotificationSignature(
            req.rawBody,
            timestamp,
            signature,
            7200
        );

        console.log("isValid =", isValid);
 

        next();
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Webhook verification failed"
        });
    }
};

export {verifyCloudinaryWebhook};