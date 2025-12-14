import { EmailOtp } from "../models/emailOtp.model.js";
import { User } from "../models/user.model.js";
import { verifyEmailOtp } from "../services/emailOtp.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyEmail = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    throw new ApiError(400, "User ID and OTP are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email already verified");
  }

  const isValid = await verifyEmailOtp(userId, otp);
  if (!isValid) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isVerified = true;
  await user.save();

  await EmailOtp.deleteMany({ user: userId });

  return res.status(200).json(
    new ApiResponse(200, null, "Email verified successfully")
  );
});
