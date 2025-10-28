import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import  ApiResponse  from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "The videoid is incorrect")
    }

    const videoExist = await Video.findById(videoId);
    if (!videoExist) {
        throw new ApiError(400, "This video does not exist.")
    }

    const checkifvideoisliked = await Like.findOne({ video: videoExist._id, owner: req.user._id, comment: { $exists: false } });
    if (!checkifvideoisliked) {
        const likevideo = await Like.create({
            video: videoExist._id,
            owner: req.user._id
        })

        return res
            .status(200)
            .json(new ApiResponse(20, likevideo, "Video liked successfully."))
    } else {
        const removelike = await Like.findOneAndDelete({ video: videoExist._id, owner: req.user._id });
        return res
            .status(200)
            .json(new ApiResponse(200, removelike, "Video like removed successfully."))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "The commentId is incorrect")
    }

    const CommentExistence = await Comment.findById(commentId);
    if (!CommentExistence) {
        throw new ApiError(40, "This comment does not exist.")
    }

    const toggleCommentlikes = await Like.findOne({comment:commentId, owner:req.user._id});
    if (!toggleCommentlikes) {
        const likeComment = await Comment.create({
            comment: commentId,
            owner:req.user._id,
            video: CommentExistence.video
        })

        return res
            .status(200)
            .json(new ApiResponse(200, likevideo, "Comment liked successfully."))
    } else {
        const removelike = await Like.findOneAndDelete({ video: videoExist._id, owner: req.user._id, comment:commentId });
        return res
            .status(200)
            .json(new ApiResponse(200, removelike, "Comment like removed successfully."))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedvideos = await Like.find({
        video: { $exists: true },
        owner: req.user._id
    }).populate("video")

    return res
        .status(200)
        .json(new ApiResponse(200, likedvideos, "Fetched liked videos successfully."))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}