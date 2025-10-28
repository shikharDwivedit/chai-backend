import mongoose, { isValidObjectId } from "mongoose"
import { Admin } from "../models/admin.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

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


const deleteVideo = asyncHandler(async (req,res) => {

})

export {registerAsAdmin};