import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarlocalfilePath = req.file?.path;

  if (!avatarlocalfilePath) {
    throw new ApiError(401, "File is required.");
  }
  // Todo - delete the old image
  const avatar = await uploadFileOnCloudinary(avatarlocalfilePath);

  if (!avatar.url) {
    throw new ApiError(501, "Error while updating avatar.");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Avatar updated successfully."))
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
  const CoverlocalfilePath = req.files?.path;

  if (!CoverlocalfilePath) {
    throw new ApiError(401, "File is required.");
  }

  const coverImage = await uploadFileOnCloudinary(CoverlocalfilePath);

  if (!coverImage.url) {
    throw new ApiError(501, "Error while updating coer image.");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");
    
  return res
  .status(200)
  .json(new ApiResponse(200,user,"Cover image updated successfully."))

});

export { updateUserAvatar, updateUserCoverImage };
