import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const user = req.user._id;
    const {videoId} = req.params
    const content = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id incorrect")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner: user
    })


    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment posted successfully."))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {text} = req.body;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Bad comment request.")
    }

    const commentsearch = await Comment.findById(commentId);
    
    if(!commentsearch){
        throw new ApiError(400,"This comment doesn't exist")
    }
    commentsearch.content = text;
    await commentsearch.save();

    return res
    .status(200)
    .json(new ApiResponse(200,commentsearch,"Updated comment successfully."))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Bad comment request.")
    }

    const deletecomment = await Comment.findByIdAndDelete(commentId);

    if(!deletecomment){
        throw new ApiError(400,"This comment doesn't exist.");
    }

    return res
    .status(200)
    .json(200,{},"Comment deleted successfully.")
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }