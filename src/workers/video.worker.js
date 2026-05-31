import "dotenv/config";
// look at the bottom

import { Video } from "../models/video.model.js";
import { Worker } from "bullmq";
import logger from "../utils/logger.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import connectDB from "../db/index.js";
console.log(process.env.CLOUDINARY_CLOUD_NAME)
connectDB()
const worker = new Worker(
    "video-processing",
    async(job) =>{
        // completing the work of uploading the video
        // step 1: get the metadata from queue cause req has died with res so we can use req.file
        // step 2: same old thing check and upload the file and wait for confirmation
        
        const {
            videoID,
            localVideoPath,
            thumbnailLocalPath,
        } = job.data;
  
        try{
            const videoDocument = await Video.findById(videoID);
            if (!videoDocument) {
                throw new Error("Video document not found");
            }
            videoDocument.status = "processing";
            await videoDocument.save();

            const video = await uploadFileOnCloudinary(localVideoPath);
            const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath);
            
            if (!video || !thumbnail) {
                throw new Error("Files weren't uploaded successfully, please try again later.");
            }
            videoDocument.videofile = video.url;
            videoDocument.thumbnail = thumbnail.url;
            videoDocument.duration = video.duration;
            videoDocument.status = "ready";
            await videoDocument.save();
            
        }catch(error){                   
                logger.error({
                event: "VIDEO_PROCESSING_FAILED",
                message: error.message,
                stack: error.stack,
                jobId: job.id,
                videoID
            });
            throw error;
        }
        logger.info('Processing completed')
    },
    {
        connection:{
            host:'127.0.0.1',
            port:6379
        },
        concurrency:5   // number of jobs each worker can handle simulatenously.
        // it doesn't mean number of workers because worker is only 1 here fixed.
    }
);

worker.on("ready", () => {
    logger.info("Worker ready");
});



worker.on("failed", async(job, err) => {

    logger.error(`Job failed: ${job?.id}`);
        // FINAL FAILURE
    if (job.attemptsMade >= job.opts.attempts) {

        await Video.findByIdAndUpdate(
            job.data.videoID,
            {
                status: "failed"
            }
        );
        logger.error(err);
    }
});

worker.on("completed", (job) => {

    logger.info(
        `Job completed: ${job.id}`
    );
});


/*
import dotenv/config is short form for 
import dotenv from ...
dotenv.config()
even if we placed it above import of uploadcloudinary it would still fail because in esm module
first modules are imported then runtime runs so uploadcloudinary key becomes undefined and throw error 
to fix it we the new import it act as module import hence dotenv is imported and configured first then rest imports happens
*/