import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    let {content} = req.body;
    console.log(content)
    if(content  == ""){
        throw new ApiError(400,"The field cannot be left empty.");
    }

    const comment = await Tweet.create({
        content,
        owner:req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,comment.content,"Comment posted successfully."));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // as we need to pass jwt hence user must be valid therefore we skip the checking part

    const tweets = await Tweet.find({owner:req.user._id}).select('-_id -owner -createdAt -updatedAt');
    console.log(tweets)
    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"Tweets successfully fetched."));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if(content  == ""){
        throw new ApiError(400,"The field cannot be left empty.");
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Bad request");
    }

    const tweet = await Tweet.findById(tweetId);
    //Existence of tweet
    if(!tweet){
        throw new ApiError(400,"Tweet not found.")
    }
    // check ownership
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401,"Only the owner is allowed to change the tweet.")
    }

    tweet.content = content;
    await tweet.save();
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Message changed successfully."))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
        const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Bad request");
    }

    const tweet = await Tweet.findById(tweetId);
    //Existence of tweet
    if(!tweet){
        throw new ApiError(400,"Tweet not found.")
    }
    // check ownership
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(401,"Only the owner is allowed to change the tweet.")
    }

    await tweet.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200,{}, "Tweet removed successfully."))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}