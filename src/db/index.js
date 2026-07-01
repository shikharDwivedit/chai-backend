import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client/extension";
import { PrismaNeon }

console.log(DB_NAME)
// const connectDB = async () =>{
//     try{
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         console.log(`\n MongoDB Connection Succesful || DB HOST
//             ${connectionInstance.connection.host}`)
    
//         // time for NeonDB
//     }catch(error){
//         console.log("Error in database connection: ",error);
//         throw error;
//     }
// }


// clean version
const connectDB = async () =>{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`\n MongoDB Connection Succesful || DB HOST ${connectionInstance.connection.host}`);

    // time for NeonDB
    
}

export default connectDB