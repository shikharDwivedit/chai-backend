import {Report} from "../models/report.model.js";
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {isValidObjectId} from "mongoose"
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

// Clean method to use var Map to replace if type === video || comment
const Map_model = {
    Video,
    Comment
}
const reportObjects = asyncHandler(async (req,res) => {
    const user = req.user._id;
    const {targetType,targetId, reason} = req.body;

    if(!targetType || !targetId || !reason){
        throw new ApiError(400,"Please select all the fields properly.")
    }

    if(!isValidObjectId(targetId)){
        throw new ApiError(400,"Invalid target id.");
    }
    
    if( targetType != 'Video' && targetType != 'Comment'){
        throw new ApiError(400,"Please use proper fields.");
    }
    const Model = Map_model[targetType]

    const document = await Model.findById(targetId);
    if(document === null){
        throw new ApiError(400,"This document doesn't exists.");
    }
    const report_creation = await Report.create({
        targetType,
        targetId,
        reportedBy:user,
        reason
    })

    return res
    .status(200)
    .json(new ApiResponse(200,report_creation,"Video reported successfully."))
})

  
export {
    reportObjects
}