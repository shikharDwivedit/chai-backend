import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // Steps taken to register a user
  // get user details from frontend
  // validation - for every field in schema not empty
  // check if user already exists:username, email
  // check for images, check for avatar
  // upload them to cloudinary, check for avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { username, email, fullName, password } = req.body;
  console.log(req.body);
  console.log(username);

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const existeduser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existeduser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  //handling files
  // With the below we are fetching file where multer had saved it
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required.");
  }

  // uploading on cloudinary
  const avatar = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Avatar image wasn't uploaded succesfully.");
  }
  
  //creating entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });
  
  // we used select because we further need to return a response
  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  );
  if(!createdUser){
      throw new ApiError(500, "Server Error unable to create profile at the moment.");
  }
  
  return res.status(201).json(
      new ApiResponse(200, createdUser,"Registered Successfully.")
  )

});

export { registerUser };