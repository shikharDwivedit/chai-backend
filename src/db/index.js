import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

console.log(DB_NAME)
const connectDB = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB Connection Succesful || DB HOST
            ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("Error in database connection: ",error)
    }
}

export default connectDB