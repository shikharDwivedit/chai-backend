# Chai Backend — Project Documentation

## Overview

Chai Backend is an Express.js REST API for a video/tweet-like application. It provides user authentication, video upload and streaming support, likes, comments, playlists, admin controls, and basic analytics/dashboard endpoints.

## Features

- User signup / login (JWT access & refresh tokens)
- Email OTP verification
- Video upload (Cloudinary)
- Likes, comments, playlists, reports
- Admin routes for moderation
- Redis support for caching (local default)

## Tech Stack

- Node.js (ES modules) + Express
- MongoDB (mongoose)
- Redis (ioredis)
- Cloudinary for media storage
- Nodemailer for email

## Quick Links (key files)

- Project root: [readme.md](readme.md)
- App setup: [src/app.js](src/app.js)
- Server entrypoint: [src/index.js](src/index.js)
- Database connect: [src/db/index.js](src/db/index.js)
- Environment/constants: [src/constants.js](src/constants.js)
- Routes: [src/routes](src/routes)
- Controllers: [src/controllers](src/controllers)
- Models: [src/models](src/models)
- Utilities: [src/utils](src/utils)
- Middleware: [src/middleware](src/middleware)

## File Structure (high level)

The repository layout (abridged):

- [src/](src/)
  - `app.js` — Express app, middleware, route mounting
  - `index.js` — dotenv load, DB connect, server start
  - `db/index.js` — MongoDB connection
  - `controllers/` — route handlers (users, videos, likes, etc.)
  - `routes/` — route definitions
  - `models/` — Mongoose models
  - `utils/` — `cloudinary.js`, `mailer.js`, `redis.js`, helpers
  - `middleware/` — auth, file upload, rate-limiters

## Local Setup

Prerequisites:

- Node.js 18+ and npm
- MongoDB accessible (local or cloud)
- (Optional) Redis running locally for caching

Install dependencies:

```bash
npm install
```

Run (development):

```bash
# with nodemon (recommended for development)
npm run devs

# or directly
node src/index.js
```

Note: `package.json` includes `devs` which runs `nodemon -r dotenv/config --experimental-json-modules src/index.js`.

## Required Environment Variables

Create a `.env` file at the project root (the app loads `./.env`). At minimum define:

- `MONGODB_URL` — MongoDB connection URI (without database name). The app appends the database name from `src/constants.js` (default `backenddatabase`).
- `PORT` — Port to run the server (defaults to `8000`).
- `ACCESS_TOKEN_SECRET` — JWT signing secret for access tokens
- `ACCESS_TOKEN_EXPIRY` — e.g. `15m` or `1h`
- `REFRESH_TOKEN_SECRET` — JWT secret for refresh tokens
- `REFRESH_TOKEN_EXPIRY` — e.g. `7d`
- `EMAIL_USER` — SMTP/email user (used by Nodemailer)
- `EMAIL_PASS` — SMTP/email password
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret
- `CORS_ORIGIN` — Allowed origin for CORS (e.g. `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` — (optional) Google OAuth client id used in controllers

Optional / notes:

- Redis connection is configured in `src/utils/redis.js` and defaults to `127.0.0.1:6379`.
- If you deploy to a cloud provider, set the environment variables in their dashboard.

## API Overview

All API endpoints are mounted under `/api/v1`.

Main route groups:

- `/api/v1/users` — registration, login, profile, OTP, social logins
- `/api/v1/videos` — upload, fetch, stream videos
- `/api/v1/likes` — like/unlike resources
- `/api/v1/tweets` — short text posts
- `/api/v1/playlist` — user playlists
- `/api/v1/dashboard` — analytics and watch-history
- `/api/v1/admin` — admin-only moderation endpoints

For full route definitions, see the files in [src/routes](src/routes).

## Uploading This Documentation to GitHub Pages

Important: GitHub Pages can only serve static content (HTML/CSS/JS). You cannot host this Express backend on GitHub Pages. Use Pages to host this documentation, or deploy the API to a cloud host (see below).

Option A — Serve docs from the `docs/` folder on the default branch (simplest):

1. Ensure this file is at `docs/index.md` (done).
2. Commit and push to GitHub.
3. In your repository Settings → Pages, set the Source to `Deploy from a branch` and select the branch (e.g., `main`) and folder `/docs`.
4. Wait a minute — your documentation will be available at `https://<your-username>.github.io/<repo>/`.

Option B — Use the `gh-pages` branch (if you generate static HTML):

1. Install `gh-pages` and add a deploy script if you generate HTML via a static site generator (optional):

```bash
npm install --save-dev gh-pages
# example package.json script:
# "deploy:docs": "gh-pages -d docs"
```

2. Run the deploy script to push compiled docs to `gh-pages` branch.

Option C — Use a static site generator (recommended if you want a nicer docs site):

- Tools: Docusaurus, MkDocs, Hugo, or GitHub Pages with a simple static HTML template.
- Generate site into `docs/` or configure your generator to output into `docs/` and follow Option A.

## Hosting the Backend (recommended providers)

Because GitHub Pages cannot host servers, consider these providers to run your API:

- Render.com — easy Node deployments, connect to Git, set env vars in dashboard.
- Railway.app — quick deploys with mongo addons.
- Heroku (legacy but still used) — set env vars via dashboard; use `Procfile`.
- DigitalOcean / VPS — full control, requires server setup.

Quick deploy checklist for these hosts:

1. Set environment variables in the provider dashboard.
2. Ensure `MONGODB_URL` is reachable (use Atlas or self-hosted DB).
3. Add a `start` script to `package.json` (recommended):

```json
"scripts": {
  "start": "node src/index.js",
  "devs": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
}
```

4. Configure file storage (Cloudinary) credentials in env.

## Security & Production Notes

- Keep JWT secrets and API keys out of version control. Use environment variables or secret managers.
- Enable HTTPS / TLS on your host.
- Rate-limit login endpoints (there is a `loginRateLimiter.middleware.js` file present).
- Sanitize and validate uploaded files; the app uses `multer` and Cloudinary.

## Contributing

- Fork, create a branch, push changes, and open a PR.
- Run linters/formatters (`prettier` is listed in devDependencies).

## Troubleshooting

- If the server does not start, check `PORT` and `MONGODB_URL` in your `.env`.
- For Cloudinary upload issues, verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
- For email issues, verify `EMAIL_USER`/`EMAIL_PASS` and that the account allows SMTP access.

