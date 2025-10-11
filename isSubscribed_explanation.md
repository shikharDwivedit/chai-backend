# MongoDB Aggregation: `isSubscribed` Explanation

This document explains how the `isSubscribed` field works in your aggregation pipeline.  
It checks whether the currently logged-in user is subscribed to a given channel.

---

## Aggregation Example with Comments

```js
const userChannel = await User.aggregate([
  {
    $match: {
      userName: username?.toLowerCase() // Step 1: Match the channel/user by username
    }
  },
  {
    $lookup: { // Step 2: Lookup all subscribers of this channel
      from: "subscriptions",
      localField: "_id",           // Match User _id (channel id)
      foreignField: "channel",     // In subscriptions collection, "channel" points to User _id
      as: "subscribers"            // Store results in "subscribers" array
    }
  },
  {
    $lookup: { // Step 3: Lookup all channels this user has subscribed to
      from: "subscriptions",
      localField: "_id",           // Match User _id
      foreignField: "subscriber",  // In subscriptions collection, "subscriber" points to User _id
      as: "subscribedTo"           // Store results in "subscribedTo" array
    }
  },
  {
    $addFields: {
      subscriberCount: {
        $size: "$subscribers" // Count subscribers for this channel
      },
      ChannelSubscribedToCount: {
        $size: "$subscribedTo" // Count how many channels this user has subscribed to
      },
      isSubscribed: { // Step 4: Check if the logged-in user is in the subscribers list
        $cond: {
          if: { $in: [ req.user?._id, "$subscribers.subscriber" ] }, // Is req.user._id inside subscribers.subscriber array?
          then: true,  // Yes → return true
          else: false  // No → return false
        }
      }
    }
  }
]);
```

---

## How `isSubscribed` Works

1. `$subscribers` comes from the first `$lookup`.  
   Example:
   ```json
   "subscribers": [
     { "_id": 1, "channel": 123, "subscriber": "userA" },
     { "_id": 2, "channel": 123, "subscriber": "userB" }
   ]
   ```

2. `"subscribers.subscriber"` extracts just the `subscriber` field →  
   ```json
   [ "userA", "userB" ]
   ```

3. `$in: [ req.user._id, "$subscribers.subscriber" ]` checks if the logged-in user’s id exists in that array.

4. `$cond` works like a ternary operator:  
   ```js
   condition ? true : false
   ```

So if `req.user._id = "userA"`, `isSubscribed = true`.  
If `req.user._id = "userX"`, `isSubscribed = false`.

---

## Simplified Alternative

Instead of using `$cond`, you could directly use `$in` because it already returns true/false:

```js
isSubscribed: { $in: [ req.user?._id, "$subscribers.subscriber" ] }
```

This is shorter and works the same way.
