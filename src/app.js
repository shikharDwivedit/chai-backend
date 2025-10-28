import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//This simply parse the incoming raw string request to a javascript object and puts it in req.body
app.use(express.json({
    limit:"16kb"
}))
// This one simply extracts data from the url
app.use(express.urlencoded({limit:"16kb"}))
// This one simply stores files(pdf, image, or audio) in a public file
app.use(express.static("public"))
app.use(cookieParser())

// routes import 
import userRouter from './routes/user.routes.js'
import videorouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import adminRouter from "./routes/admin.routes.js"
// As our routes is in different location hence we can't use app.get
// routes decalartion
app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videorouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/admin", adminRouter);

export {app}