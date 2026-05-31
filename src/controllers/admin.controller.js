import { Video } from "../models/video.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import { Admin } from "../models/admin.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Report } from "../models/report.model.js"

// Register as admin

const registerAsAdmin = asyncHandler(async (req,res)=>{
    const {mailId,username} = req.body

    const user = await User.findOne({
        username:username,
        email:mailId
    })

    if(!user){
        throw new ApiError(400,"This user doesn't even exists.");
    }
    const exists = await Admin.findOne({ userId: user._id });
    if (exists) {
        throw new ApiError(400, "This user is already an admin.");
    }

    const newAdmin = await Admin.create({
        userId:user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(2300,newAdmin,"Admin registered successfully."))
})

// these are just function to remove the video or comment if needed

const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id incorrect")
    }

    const videoExist = await Video.findById(videoId)
    if(!videoExist){
        throw new ApiError(400,"This video doesn't exist")
    }   
    await videoExist.remove();

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully."));
})

const deleteComment= asyncHandler(async (req,res) => {
    const {CommentId} = req.params;
    if(!isValidObjectId(CommentId)){
        throw new ApiError(400,"Comment id incorrect")
    }   
    const commentExist = await Comment.findById(CommentId)
    if(!commentExist){
        throw new ApiError(400,"This comment doesn't exist")
    }   
    await commentExist.remove();

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully."));
})

// TODO: add reviewReports()
// TODO: add suspendUser()
// TODO: add restoreDeletedVideo()
// TODO: add moderateVideoFlags()


const reviewReports = asyncHandler(async (req, res) => {

    let {
        status = "pending",
        type,
        page = 1,
        limit = 10
    } = req.query

    // Convert to numbers
    page = Number(page)
    limit = Number(limit)

    // Allowed filters
    const allowedStatus = ["pending", "resolved", "rejected"]
    const allowedTypes = ["Video", "Comment", "User"]

    // Validate status
    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Invalid status type")
    }

    // Validate target type
    if (type && !allowedTypes.includes(type)) {
        throw new ApiError(400, "Invalid report target type")
    }

    // Build dynamic filter
    const filter = {
        status
    }

    if (type) {
        filter.targetType = type
    }

    // Pagination math
    const skip = (page - 1) * limit

    // Total matching reports
    const totalReports = await Report.countDocuments(filter)

    // Fetch reports
    const reports = await Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    // Pagination metadata
    const totalPages = Math.ceil(totalReports / limit)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                reports,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReports,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            },
            "Reports fetched successfully"
        )
    )
})

const suspendUser = asyncHandler(async(req,res)=>{
    const { user_id } = req.body
    if(!isValidObjectId(user_id)){
        throw new ApiError(401,"Please provide a correct user ID.")
    }

    const remove = await User.findByIdAndUpdate(user_id,{
        isSuspended:true
    },
        {
            new: true
        })

    if(!remove){
        throw new ApiError(400,"This user does not exists");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,null,"User suspeneded successfully."));
})


export {registerAsAdmin, deleteComment, deleteVideo,reviewReports,suspendUser};