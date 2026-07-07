import fs from "fs/promises";
import path from "path";

// IMPORTANT: local disk storage only works on a persistent server
// (a VM, Railway, Render, Fly.io, a Docker container, etc).
// It does NOT work on Vercel/serverless, since the filesystem there is
// ephemeral and wiped between requests. If you deploy to Vercel, swap the
// body of saveAudio() for an S3-compatible upload (Cloudflare R2 is cheap
// and has an S3-compatible API - same SDK, just different endpoint).

const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

export async function saveAudio(filename: string, buffer: Buffer): Promise<string> {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
  const filepath = path.join(AUDIO_DIR, filename);
  await fs.writeFile(filepath, buffer);
  // Public URL path served by Next.js static file handling
  return `/audio/${filename}`;
}

/*
// --- Example S3 / Cloudflare R2 version ---
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
//
// const s3 = new S3Client({
//   region: "auto",
//   endpoint: process.env.R2_ENDPOINT,
//   credentials: {
//     accessKeyId: process.env.R2_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
//   },
// });
//
// export async function saveAudio(filename: string, buffer: Buffer): Promise<string> {
//   await s3.send(new PutObjectCommand({
//     Bucket: process.env.R2_BUCKET,
//     Key: filename,
//     Body: buffer,
//     ContentType: "audio/mpeg",
//   }));
//   return `${process.env.R2_PUBLIC_URL}/${filename}`;
// }
*/
