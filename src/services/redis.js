import Redis from "ioredis";

const redis = new Redis({
    host:"127.0.0.1",   // means redis is running on same machine
    port:6379           // docker mapped redis to run on 6379 (container port to host port mapping)
});

redis.on("connect",() => {
    console.log("Connected successfully to yt-redis")
})

redis.on("error",() =>{
    console.log("Error encourtered while connecting to yt-redis")
})

export default redis;