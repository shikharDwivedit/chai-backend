import redis from "../services/redis.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const caching = asyncHandler(async(req,res) => {
    console.log("You hit it.")
    const task = await redis.set("test","hello-redis")

    const result = await redis.get("test")
    res.json({ result });
})

export {caching}