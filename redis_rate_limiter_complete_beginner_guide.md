# Login Rate Limiter using Redis — Beginner to Deep Understanding

---

## PART 0: Read This First

This document is written assuming:
- You are a **beginner**
- You do **not** know security terms
- You want to **understand**, not memorize
- You should be able to **explain this to your faculty**

No stones are left unturned.

---

# PART 1 — What is really happening at Login? (No security jargon)

Think of your **login page** like a **college office counter**.

Students come and say:
> “Here is my username and password.”

The staff checks:
- If correct → allowed
- If wrong → denied

Now imagine these **real-life situations**.

---

## Situation 1: Normal student forgets password

- Same student
- Same device
- Tries 2–3 times

This is **normal behavior**.
We should **not block** this student.

---

## Situation 2: Someone keeps guessing passwords

- Same username
- Many wrong passwords
- Happens very fast

This is **not normal**.
This needs to be stopped.

---

## Situation 3: A broken program or bot

- From one computer
- Tries many different accounts
- Very fast

This can **slow down or crash** the server.

---

### Important idea

**Rate limiting does NOT punish users.**  
It only **slows things down** when behavior is not normal.

---

# PART 2 — What is Redis? (Very simple)

Redis is:
- A **very fast notebook**
- Stored in **RAM**
- Used for **temporary information**

Redis is perfect for:
- Counting things
- Data that expires automatically
- Rate limiting

Redis is NOT MongoDB:
- MongoDB → permanent data
- Redis → temporary data

---

# PART 3 — Why Redis runs on Linux (WSL)

Redis works best on **Linux**.

On Windows:
- Redis does not run properly
- So we use **WSL (Linux inside Windows)**

Important fact:
> Windows programs can talk to Linux programs using **ports**

So:
- Redis runs in Linux
- Node.js runs in Windows
- Both communicate using `localhost:6379`

---

# PART 4 — The THREE Redis Keys (Core Concept)

Redis stores data as:

```
key → value
```

A key is just a **label**, like:
- attendance:cs101
- marks:roll42

Your code creates **three labels**.

---

## Key 1: IP-based key

```
login:ip:<ip>
```

Meaning:
> “How many login attempts came from this computer?”

Example:
```
login:ip:192.168.1.5 → 12
```

Why this exists:
- One computer should not spam login requests
- Protects server performance

---

## Key 2: User-based key

```
login:user:<username_or_email>
```

Meaning:
> “How many times was this account tried?”

Example:
```
login:user:shikhar@gmail.com → 6
```

Why this exists:
- Same account can be tried from many places
- Protects the user account

---

## Key 3: IP + User key (most accurate)

```
login:ip_user:<ip>:<username_or_email>
```

Meaning:
> “How many times did this user try from this device?”

Example:
```
login:ip_user:192.168.1.5:shikhar@gmail.com → 4
```

Why this exists:
- Normal users usually:
  - Same device
  - Same account
  - Few attempts

This avoids blocking real users.

---

### Important beginner takeaway

These are **NOT different Redis servers**.
They are just **different counters** inside the same Redis.

---

# PART 5 — Why ALL THREE keys are checked

```js
const keys = [
  { key: ipUserKey, limit: 5 },
  { key: userKey, limit: 10 },
  { key: ipKey, limit: 50 }
];
```

This means:

| Check | Limit | Why |
|-----|------|----|
| Same user + same device | 5 | Normal user safety |
| Same user overall | 10 | Account protection |
| Same device overall | 50 | Server protection |

If **ANY ONE** limit breaks → login is blocked.

---

# PART 6 — What happens when 1 million people use the app?

Very important clarification:

❌ Redis does NOT create 1 million Redis objects  
❌ Redis does NOT create 1 million servers  

✅ There is:
- ONE Redis server
- ONE Redis connection
- MANY small keys

Example:

```
login:user:user1 → 2
login:user:user2 → 1
login:user:user3 → 4
```

Each user just adds:
- One small number
- Which auto-deletes after time

Redis is built to handle **millions of keys** easily.

---

# PART 7 — Automatic cleanup (why Redis does not grow forever)

```js
redis.expire(key, WINDOW_SECONDS);
```

This means:
- Redis deletes the key after 10 minutes
- Memory is freed automatically
- No manual cleanup required

---

# PART 8 — Now the CODE explanation (line by line, easy)

## Redis Connection Code

```js
import Redis from "ioredis";
```
Imports Redis library.

```js
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379
});
```
Connects to Redis running on your computer.

```js
export default redis;
```
Exports the connection so the whole app uses **one Redis object**.

---

## Rate Limiter Middleware

```js
const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 10 * 60;
```
Defines rules:
- 5 attempts
- 10 minutes window

---

```js
const ip = req.ip;
const { username, email } = req.body;
```
Gets:
- Device information
- Account information

---

```js
const identifier = username || email;
```
Chooses whichever exists.

---

```js
const attempts = await redis.incr(key);
```
Increases counter by 1.

---

```js
if (attempts === 1) {
  await redis.expire(key, WINDOW_SECONDS);
}
```
Starts timer on first attempt.

---

```js
if (attempts > limit) {
  throw new ApiError(429, "Too many login attempts");
}
```
Blocks login if limit exceeded.

---

```js
next();
```
Allows login if everything is normal.

---

# PART 9 — Final mental picture (remember this)

- Redis = big notebook
- Each key = one page
- Each page = one number
- Pages auto-delete after time

Even with millions of users:
- Same notebook
- Different pages
- Very fast system

---

# PART 10 — One-paragraph explanation for faculty

The login rate limiter uses Redis counters to track login attempts. Different Redis keys are created to track attempts per device, per user, and per device-user combination. Each key has an expiry time so counters reset automatically. Redis runs inside Linux using WSL, while the Node.js application connects through localhost. This approach allows normal users while preventing excessive login attempts and scales efficiently to millions of users.

---

# END
