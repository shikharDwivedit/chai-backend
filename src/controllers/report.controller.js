import {Report} from "../models/report.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {isValidObjectId} from "mongoose"

const reportVideo = asyncHandler(async (req,res) => {
    const user = req.user._id;
    const {videoId} = req.params;
    const {reason} = req.body;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id incorrect")
    }   
    const newReport = await Report.create({
        video:videoId,
        reportedBy:user,
        reason:reason
    })
    return res
    .status(200)
    .json(new ApiResponse(200,newReport,"Video reported successfully."))
})

const reportComment = asyncHandler(async (req,res) => { 
    const user = req.user._id;
    const {commentId} = req.params;
    const {reason} = req.body;      
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Comment id incorrect")
    }       
    const newReport = await Report.create({
        comment:commentId,
        reportedBy:user,        
        reason:reason
    })
    return res
    .status(200)
    .json(new ApiResponse(200,newReport,"Comment reported successfully."))
})      
export {
    reportVideo,reportComment
};