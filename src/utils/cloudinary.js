import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadFileOnCloudinary = async (localfilepath) => {
    try{
        if(!localfilepath){
            return null;
        }

        const response = await cloudinary.uploader.upload(localfilepath,
            {
                resource_type:"auto"
            }
        )
        // file has been uploaded successfully then console log
        console.log("file is uploaded on cloudinary.");
        console.log(response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localfilepath);   // Removes the locally saved temp file in case of failed upload operation
        console.log("Error",error);
        return null;
    }
}

export {uploadFileOnCloudinary}