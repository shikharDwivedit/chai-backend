import mongoose, { Schema, model } from "mongoose";

const LikeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },{timestamps:true}     

);

export const Like = model("Like",LikeSchema)
