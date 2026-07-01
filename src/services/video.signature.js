import crypto from "crypto";

import { UploadVideo } from "../models/uploadvideo.model.js";

import { ApiError } from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import cloudinary from "../utils/cloudinary.js";

export const generateUploadSignature = asyncHandler(async (req, res) => {

const { title, description } = req.body;

if (!req.user) {
    throw new ApiError(401,"Unauthorized access.");
}

if (!title || !description) {
    throw new ApiError(400,"Title and description is required.");
}

const uploadId = crypto.randomUUID();

const timestamp = Math.round(Date.now() / 1000);

const notificationUrl = "https://audible-thread-overlook.ngrok-free.dev/api/v1/videos/cloudinary";

const videoPublicId =`videos/${req.user._id}/${uploadId}/video`;

// THUMBNAIL ASSET IDS
const thumbnailPublicId =`videos/${req.user._id}/${uploadId}/thumbnail`;

// VIDEO SIGNATURE
const videoParamsToSign = {
    timestamp,
    public_id: videoPublicId,
    notification_url: notificationUrl
};

const videoSignature = cloudinary.utils.api_sign_request(
        videoParamsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

// THUMBNAIL SIGNATURE
const thumbnailParamsToSign = {
    timestamp,
    public_id: thumbnailPublicId,
    notification_url: notificationUrl
};

const thumbnailSignature = cloudinary.utils.api_sign_request(
        thumbnailParamsToSign,
        process.env.CLOUDINARY_API_SECRET
    );



// CREATE WORKFLOW SESSION

await UploadVideo.create({
    title,
    description,
    uploadId,
    owner: req.user._id,
    assets: {
        video: {
            publicId: videoPublicId
        },
        thumbnail: {
            publicId: thumbnailPublicId
        }
    },
    status:"INIT",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
});



return res.status(200).json(new ApiResponse(200,
        {
            uploadId,
            timestamp,
            cloudName:process.env.CLOUDINARY_CLOUD_NAME,
            apiKey:process.env.CLOUDINARY_API_KEY,
            notificationUrl,
            videoUpload: {
                publicId:videoPublicId,
                signature:videoSignature
            },
            thumbnailUpload: {
                publicId:thumbnailPublicId,
                signature:thumbnailSignature
            }

        },

        "Upload session initialized."
    )
);
});
