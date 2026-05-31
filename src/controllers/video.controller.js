import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from 'cloudinary-build-url';
import redis from "../services/redis.js";
import { getOrSetCache } from "../utils/getOrSetCache.js";
import videoqueue from "../queue&worker/video.queue.js";
import logger from "../utils/logger.js";

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    console.log(req.body);
    console.log(req.files);

    if (!title || !description) {
        throw new ApiError(400, "Title, and description are required.");
    }

    const localVideoPath = req.files?.videofile?.[0]?.path;
    if (!localVideoPath) {
        throw new ApiError(400, "Video file is missing or not uploaded properly.");
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is missing or not uploaded properly.");
    }
    // all parameters checked. Now we create a job
    
    const videoDocument = await Video.create({
        videofile:localVideoPath,
        title,
        description,
        duration:0,
        thumbnail:thumbnailLocalPath,
        owner: req.user._id,
        status: "pending"
    });
    const job = await videoqueue.add(
        "video-processing",
        {
            videoID:videoDocument._id,
            localVideoPath,
            thumbnailLocalPath,
        },
        {
            // retries as name suggests it will try n number of times 
            // before failing if there is no success in any attempt
            attempts:3,
            backoff:{
                // delay in the time taken for retrying. Done to reduce retrying pressure 
                type:"fixed",
                delay:3000
            }
        }
    )
    logger.info(`Job queued successfully: ${job.id}`);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video Queued for processing."));
});

const getAllVideos =  asyncHandler(async (req, res) => {

    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    
    const videocollection = await Video.find({
        owner: req.user._id,
        isPublished: true,
        title: { $regex: query, $options: 'i' }
    })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);
  
    return res
    .status(200)
    .json(new ApiResponse(200, videocollection, "Fetched succesffully."))

})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    // check if the video exists or not if yes then find it
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(200, "Video ID is incorrect.");
    }

    const videoKey = `video:${videoId}`

    const data = await getOrSetCache(
        videoKey,
        async() =>{
            return await Video.findById(videoId).lean();
        }
    )
    


    return res
        .status(200)
        .json(new ApiResponse(200, data, "Video fetched successfully."))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    // validating if the id is valid or not
    // finding the document using id
    // updating it with the new file
    // My approach here is to change those fields which were modified and sent

    const vid = isValidObjectId(videoId);
    if (!vid) {
        throw new ApiError(400, "Bad request")
    }

    const updatedfield = {}
    // figuring out which fields are modified
    Object.keys(req.body).forEach(key => {

        const value = req.body[key];

        // skip undefined values
        if (value === undefined) {
            return;
        }

        // skip empty strings
        if (
            typeof value === "string" &&
            value.trim() === ""
        ) {
            return;
        }

        updatedfield[key] = value;
    })

    if (req.file) {
        const result = await uploadFileOnCloudinary(req.file)
        updatedfield.videofile = result.url
    }
    if (Object.keys(updatedfield).length === 0) {
        throw new ApiError(401, "One field is required to be changed.");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "The given video doesn't exist.");
    }
    const ownerid = video.owner;
    console.log(ownerid.toString())
    console.log(req.user._id)
    if (ownerid.toString() !== req.user._id.toString()) {
        throw new ApiError(200, "Only the owner is allowed to update the video.");
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updatedfield },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(401, "The given video doesn't exist.");
    }

    // updating invalid cache after update
    await redis.del(`video:${videoId}`);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "All the fields were updated succesfully."))

})




const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError("Please enter a valid id.");
    }

    const videoExist = await Video.findById(videoId)

    if (!videoExist) {
        throw new ApiError(400, "This video doesn't exist.");
    }
    // Deleting files from cloudnary
    console.log(videoExist.videofile)
    const videoOnCloudnary = extractPublicId(videoExist.videofile)
    const imagepublicid = extractPublicId(videoExist.thumbnail)
    try {
        if (videoOnCloudnary && imagepublicid) {
            await cloudinary.uploader.destroy(videoOnCloudnary, { resource_type: "video" });
            await cloudinary.uploader.destroy(imagepublicid)
            console.log("File successfully deleted from cloudnary.")
        }
    } catch (error) {
        throw new ApiError(500, "There was an issue with the server please try again later.")
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, deleteVideo, "Video deleted successfully."))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError("Please enter a valid id.");
    }

    const videoExist = await Video.findById(videoId)

    if (!videoExist) {
        throw new ApiError(400, "This video doesn't exist.");
    }

    videoExist.isPublished = !videoExist.isPublished;

    return res
        .status(200)
        .json(new ApiResponse(200, videoExist.isPublished, "Successfully changed the status."))
})

// TODO: add getTrendingVideos()
// TODO: add getRecommendedVideos()
// TODO: add getSubscribedFeedVideos()
// TODO: add searchVideos()
// TODO: add getVideoAnalytics()

export { publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideos };
