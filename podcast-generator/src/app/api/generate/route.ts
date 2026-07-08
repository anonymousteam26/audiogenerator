import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { extractText } from "@/lib/extractText";
import { generatePodcastScript, LengthMode } from "@/lib/llm";
import { synthesizeEpisode, estimateDurationSec } from "@/lib/tts";
import { saveAudio } from "@/lib/storage";
import { checkRateLimit, getClientIp, hashIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 300; // this pipeline is slow; extend the function timeout

const VALID_LENGTHS: LengthMode[] = ["short", "medium", "long"];
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 30MB upload cap

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const ipHash = hashIp(ip);

  const { allowed, remaining } = checkRateLimit(ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again in a bit." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const lengthMode = formData.get("lengthMode") as LengthMode;

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!VALID_LENGTHS.includes(lengthMode)) {
    return NextResponse.json({ error: "Invalid length mode." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large (15MB max)." }, { status: 400 });
  }

  // Create the DB row immediately so the client can poll status
  // while the (slow) generation work happens below.
  const episode = await db.episode.create({
    data: {
      id: uuidv4(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      sourceName: file.name,
      lengthMode,
      status: "scripting",
      ipHash,
    },
  });

  // Fire-and-forget style: respond after kicking off work, client polls
  // GET /api/episodes/:id for status. In production, hand this off to a
  // real job queue (Inngest / Trigger.dev / BullMQ) instead of doing it
  // inline in the request — inline works for a demo but blocks the
  // function for the whole pipeline duration.
  processEpisode(episode.id, file, lengthMode).catch(async (err) => {
    await db.episode.update({
      where: { id: episode.id },
      data: { status: "failed", errorMsg: String(err.message ?? err) },
    });
  });

  return NextResponse.json({ episodeId: episode.id, remaining });
}

async function processEpisode(episodeId: string, file: File, lengthMode: LengthMode) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractText(buffer, file.type, file.name);

  const script = await generatePodcastScript(text, lengthMode);

  await db.episode.update({ where: { id: episodeId }, data: { status: "narrating" } });

  const audioBuffer = await synthesizeEpisode(script);
  const filename = `${episodeId}.mp3`;
  const audioUrl = await saveAudio(filename, audioBuffer);
  const durationSec = estimateDurationSec(script);

  await db.episode.update({
    where: { id: episodeId },
    data: { status: "ready", audioUrl, durationSec },
  });
}
