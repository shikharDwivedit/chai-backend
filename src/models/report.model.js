import mongoose,{Schema,model} from "mongoose";


const ReportSchema = new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
        required:true
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment",
    },
    reportedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    reason:{
        type:String,
        required:true
    },

},{timestamps:true})


const Report = model("Report",ReportSchema)