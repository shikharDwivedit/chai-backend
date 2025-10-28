import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";




export const verifyAdmin = asyncHandler(async(req,res,next)=>{
    const userId = req.user._id;
    const isAdmin = await Admin.findOne({
        userId
    });
    if(!isAdmin){
        throw new ApiError(403,"Admin only")
    }
    next();
})