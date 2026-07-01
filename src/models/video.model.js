import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { publishAVideo } from "../controllers/video.controller.js";
const videoSchema = new Schema(
    {
        videofile: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required:true
        },
        thumbnail: {
            type: String,
            required: true
        },
        views:{
            type:Number,
            default:0,
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "ready",
                "failed"
            ],
            default: "pending"
        },
        tags: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
)

videoSchema.index({
    title: "text",
    description: "text",
    tags: "text"
});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema)