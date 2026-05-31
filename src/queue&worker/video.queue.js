import { Queue } from "bullmq";

const videoqueue = new Queue('video-processing',{
    connection:{
        host:"127.0.0.1",
        port:6379
    }
})

export default videoqueue
// we created a named queue pipeline where worker will constantly will listen to fetch pending job