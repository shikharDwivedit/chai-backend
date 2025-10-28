import mongoose, {Schema, model} from "mongoose";


const AdminSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    }
},{timestamps:true})


export const Admin = model("Admin",AdminSchema);