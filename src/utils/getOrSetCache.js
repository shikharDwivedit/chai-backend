import redis from "../services/redis.js";
import { ApiError } from "./ApiError.js";



const getOrSetCache = async(key,callback,time = 300)=>{

    const cachedata = await redis.get(key);
    // cache hit
    if(cachedata){
        console.log("Cache Hit")
        return JSON.parse(cachedata)
    }

    // cache miss
    const freshData = await callback();

    if(!freshData){
        throw new ApiError(404,"No Data Found");
    }
    // set cache
    await redis.setex(
        key,
        time,
        JSON.stringify(freshData)
    )
    return freshData;
}

export {getOrSetCache}