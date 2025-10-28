import mongoose, { Schema, model } from "mongoose";

const TweetSchema = new Schema(
    {
        content:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:true}
)



export const Tweet = model("Tweet",TweetSchema)