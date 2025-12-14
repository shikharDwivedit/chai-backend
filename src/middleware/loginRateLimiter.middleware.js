import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import redis from "../utils/redis.js"; // your redis client

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 10 * 60; // 10 minutes

export const loginRateLimiter = asyncHandler(async (req, res, next) => {
  const ip = req.ip;
  const { username, email } = req.body;

  // If no identifier, let controller handle validation
  if (!username && !email) {
    return next();
  }

  const identifier = username || email;

  const ipKey = `login:ip:${ip}`;
  const userKey = `login:user:${identifier}`;
  const ipUserKey = `login:ip_user:${ip}:${identifier}`;

  const keys = [
    { key: ipUserKey, limit: MAX_ATTEMPTS },
    { key: userKey, limit: 10 },
    { key: ipKey, limit: 50 }
  ];

  for (const { key, limit } of keys) {
    const attempts = await redis.incr(key);

    // First attempt → set expiry
    if (attempts === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    if (attempts > limit) {
      throw new ApiError(
        429,
        "Too many login attempts. Please try again later."
      );
    }
  }

  next();
});
