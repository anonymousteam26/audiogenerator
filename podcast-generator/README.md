# Doc → Podcast

Upload a document (PDF, DOCX, or TXT), get back a two-host podcast-style
audio overview discussing it. Public, anonymous uploads, with a length
toggle (short/medium/long) and a history of past generated episodes.

## How it works

1. **Upload** — file is parsed server-side to extract raw text (`pdf-parse` / `mammoth`).
2. **Script generation** — the text is sent to Claude with a prompt targeting a word count for the chosen length, and it returns a two-host script as structured JSON.
3. **Narration** — each script line is sent to OpenAI's TTS API with a distinct voice per host, and the resulting audio clips are stitched into one file.
4. **Storage** — the finished mp3 is saved (local disk by default — see caveat below) and a row is written to the database so it shows up in "Past episodes."

## Stack

- Next.js 14 (App Router) — frontend + API routes in one project
- Prisma + SQLite (swappable to Postgres) — episode metadata
- Claude API — script generation
- OpenAI TTS — narration
- Local filesystem storage (swappable to S3/Cloudflare R2 — see `src/lib/storage.ts`)

## Local setup

```bash
npm install
cp .env.example .env
# fill in ANTHROPIC_API_KEY and OPENAI_API_KEY in .env
npx prisma db push
npm run dev
```

Visit `http://localhost:3000`.

## Deploying

**Important:** this scaffold uses local disk storage for audio files by
default, which only works on a persistent server (a VM, Railway, Render,
Fly.io, a Docker container). It will **not** work on Vercel or other
serverless hosts, since their filesystem is ephemeral. If you deploy to
Vercel:

1. Swap `src/lib/storage.ts` to upload to S3 or Cloudflare R2 instead (a commented example is already in that file).
2. Swap the Prisma datasource from `sqlite` to `postgresql` and point `DATABASE_URL` at a hosted Postgres instance (Supabase and Neon both have free tiers).
3. Move the in-memory rate limiter in `src/lib/rateLimit.ts` to Redis (Upstash has a serverless-friendly free tier), since in-memory state doesn't persist or share across serverless invocations.
4. Move the inline generation pipeline in `src/app/api/generate/route.ts` to a real background job queue (Inngest or Trigger.dev both have Vercel-friendly free tiers) — inline works for a demo, but a 15-minute episode's worth of generation can exceed a serverless function's execution time limit.

## Cost & abuse controls already in place

- 15MB upload size cap (`src/app/api/generate/route.ts`)
- 60,000 character extraction cap (`src/lib/extractText.ts`)
- IP-based rate limiting: 5 generations/hour per IP (`src/lib/rateLimit.ts`)

Since uploads are public and anonymous, keep an eye on real-world API
spend early on and tighten these caps if needed.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: doc-to-podcast scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
