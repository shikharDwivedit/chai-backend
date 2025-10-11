import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
  // With the below line we are trying to fetching files saved by multer
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //Extra fix js core issue not coding issue
  let coverImageLocalPath;
  // Condition => req.files is there or not & req.files.coverImage is array or not if it is array then its length should be >0
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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

const generateAccessAndRefreshToken = async (userId) => {
  try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave:false});

    return {accessToken,refreshToken};
  }catch(error){
    throw new ApiError(500, "Something went wrong while generating refresh and access Token");
  }
}

const loginUser = asyncHandler(async (req,res) => {
  //  Algorithm
  // req nody -> data
  // username or email based
  // find the user
  // password check
  // access token and refresh token
  // send cookie

  const {username, email, password} = req.body;

  if(!(username || email)){
    throw new ApiError(400,"Username or email can't be left blank.");
  }

  const user = await User.findOne({   //we are trying to find match based on email or username
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404, "User doesn't exists please signup.")
  }

  // note we used user not User because the method metioned below is with our mongodb object not mongoose
  const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
    throw new ApiError(401, "Incorrect password please try again.")
  }

  const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id);

  const loginedUser = await User.findById(user._id).
  select("-password -refreshToken");

  //sending cookies
  const options = {
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loginedUser, accessToken,refreshToken
      },
      "User logged in Successfully."
    )
   )

})

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:1   //this removes the field(refresh token) from the header
      }
    },
    {
      new:true
    }
  )

  const options = {
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged out successfully."))
})

const refreshTokens = asyncHandler(async(req,res) => {
  // Fetch the the user refreshToken and match it in database
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if(!incomingRefreshToken){
    throw new ApiError(401,"Unathorized request");
  }

 try {
   const verifyToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
 
   const user = User.findById(verifyToken?._id);
   if(!user){
     throw new ApiError(401,"Invalid token!");
   }
 
   if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(400,"Refresh Token is expired");
   }
 
   const options = {
     httpOnly:true,
     secure:true
   }
 
   const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id);
 
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newrefreshToken,options)
   .json(
     new ApiResponse(
       200,
       {accessToken, refreshToken:newrefreshToken},
       "Access Token refreshed successfully."
     )
   )
 } catch (error) {
  throw new ApiError(401,error?.message||"Invalid refresh Token.")
 }
})

const ChangePassword = asyncHandler(async(req,res) => {

  const {oldpassword, newpassword} = req.body;

  const userid = req.user?._id;
  const user = await User.findById(userid);
  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);
  if(!isPasswordCorrect){
    throw new ApiError(401,"Old password isn't correct.");
  }
  user.password = newpassword
  await user.save({validateBeforeSave:false});

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully."))
})

const getCurrentUser = asyncHandler(async(req,res) => {

  return res
  .status(200)
  .json(new ApiResponse(200,req.user,"Current user fetched successfully."))
})
 
const updateUserDetails = asyncHandler(async (req,res) => {
  const {fullName,email} = req.body;

  if(!(fullName || email)){
    throw new ApiError(401,"All fields are required.");
  }

  const user =  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName:fullName,
        email
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account details updated successfully."))
})

const getUserChannelProfile = asyncHandler(async (req,res) => {
  const {username} = req.params

  if(!username.trim()){
    throw new ApiError(401,"Invalid request, User does not exist.")
  }


  const userChannel = await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()    //Finding the desired channel
      }
    },
    {
      $lookup:{       //looking for subscbriber of that channel
        from:"subscriptions",     // look in the subscript collection
        localField:"_id",         // id of current user {aka the userName which is channel in our case}
        foreignField:"channel",    // find all the document in which channel = userid
        as:"subscribers"
      }
    },
        {
      $lookup:{       
        from:"subscriptions",     
        localField:"_id",        
        foreignField:"subscriber",    
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
          subscriberCount:{
            $size:"$subscribers"    // adding the subscribers field to get number of subscriber
          },
          ChannelSubscribedToCount:{
            $size:"$subscribedTo"   // finding the number to whom we have subscribed.
          },
          isSubscribed:{      // checking if we have subscribed to a xyz channel or not
            $cond:{
              if: {$in:[req.user?._id,"$subscribers.subscriber"]},
              then:true,
              else:false
            }
          }
      }
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscriberCount: 1,
        ChannelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      }      
    }
  ])

  //note: userChannel is just an array with 1 object because there will only be one channel with a unique user_id hence if if len == 0 then it means channel doesn't exists
  console.log(userChannel)

  if(!userChannel?.length){
    throw new ApiError(404,"This channel doesn't exists.")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,userChannel[0],"User channel fetched succesfully.")
  )
})

const getWatchHistory = asyncHandler(async (req,res) => {
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as:"owner",
              pipeline:[
                {
                  $project: {
                    fullName: 1,
                    username:1,
                    avatar: 1
                  }
                }
              ]
            
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully.")
  )
})

export { registerUser, loginUser, logoutUser, refreshTokens,
         ChangePassword, getCurrentUser, updateUserDetails, getUserChannelProfile,
         getWatchHistory
 };