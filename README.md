# Reel — AI Video Generator

A ready-to-run web app: type a prompt, get back a generated video. It's a thin, polished front end over [Replicate](https://replicate.com)'s hosted video models (Kling, Seedance, Luma, etc.), so you don't have to run any AI models yourself.

## What you need before running it

1. **Node.js** installed (v18 or newer). Check with `node -v`. If you don't have it: https://nodejs.org
2. **A free Replicate account + API token**: https://replicate.com/account/api-tokens
   - Replicate is pay-per-generation (no monthly fee). Video clips typically cost roughly $0.02–$0.50 each depending on the model and length — check current pricing on the model's page before launching this as a paid product.

## Setup (one time)

Open a terminal in this folder and run:

```bash
npm install
cp .env.example .env
```

Then open `.env` in any text editor and paste your Replicate token:

```
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

## Run it

```bash
npm start
```

Then open **http://localhost:3000** in your browser. Type a prompt, hit Generate, and wait — video generation typically takes 30 seconds to a few minutes depending on the model and length.

## Changing the video model

Edit `REPLICATE_MODEL` in your `.env` file. Browse options at https://replicate.com/explore?query=video — popular choices:

| Model | Good for |
|---|---|
| `bytedance/seedance-1-lite` | fast, cheap, good default |
| `bytedance/seedance-1-pro` | higher quality |
| `kwaivgi/kling-v1.6-standard` | best motion/physics, people |

Different models accept slightly different input fields. This app sends `prompt`, `duration`, and `aspect_ratio` — if you switch models and something breaks, check that model's "API" tab on Replicate to see its exact input schema and adjust `server.js` (`app.post('/api/generate', ...)`) accordingly.

## Turning this into a real product

This is a working local prototype. Before selling access to other people, you'll want to:

- **Deploy it** somewhere always-on (Railway, Render, Fly.io, or a small VPS all work well for a Node app like this).
- **Add your own user accounts + payments** (e.g. Clerk/Auth.js for login, Stripe for billing) so you're not paying Replicate out of pocket for every visitor.
- **Add rate limiting** so one user can't run up unlimited generation costs.
- **Read Replicate's terms of service** for commercial use and content policy restrictions on the specific model you choose.

## File structure

```
video-generator-app/
├── server.js          Express server — talks to Replicate's API
├── package.json        dependencies
├── .env.example         copy to .env and fill in your token
└── public/
    └── index.html       the web page (UI + all its JS/CSS)
```
