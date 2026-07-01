import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // Fetching videos
    const UserVideos = await Video.find({
        owner: req.user._id
    })
    const videoIds = UserVideos.map(v => v._id);
    // Finding total subscriber
    const subscriberCountResult = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: "$channel",
                subscriberCount: { $sum: 1 }
            }
        }
    ])
    const totalSubscribers = subscriberCountResult.length > 0 ? subscriberCountResult[0].subscriberCount : 0;
    console.log("Total Subscribers:", totalSubscribers);

    // total views

    const totalViewResult = await User.aggregate([
        {
            $unwind: "$watchHistory"
        },
        {
            $match: { watchHistory: { $in: videoIds.map(id => new mongoose.Types.ObjectId(id)) } }
        },
        {
            $group: {
                _id: null,
                totalviews: { $sum: 1 }
            }
        }
    ])

    const totalViews = totalViewResult.length > 0 ? totalViewResult[0].totalViews : 0;
    console.log("Total Views:", totalViews);
    // total likes
    const totalLikeResult = await Like.aggregate([
        {
            $match: {
                video: { $in: videoIds.map(id => new mongoose.Types.ObjectId(id)) },
                comment: null,
                tweet: null,
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: 1 }
            }
        }
    ])
    const totalLikes = totalLikeResult.length > 0 ? totalLikeResult[0].totalLikes : 0;
    console.log("Total Likes:", totalLikes);
    return res.status(200).json({
        totalVideos: UserVideos.length,
        totalSubscribers,
        totalViews,
        totalLikes
    });

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
        const UserVideos = await Video.find({
        owner: req.user._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,UserVideos,"All videos of current user fetched succesfully."))
})

export {
    getChannelStats,
    getChannelVideos
}