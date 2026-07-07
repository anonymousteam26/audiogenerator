import OpenAI from "openai";
import type { ScriptLine } from "./llm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Two distinct voices so the two hosts sound different.
// Full voice list: https://platform.openai.com/docs/guides/text-to-speech
const VOICE_MAP: Record<ScriptLine["speaker"], string> = {
  HOST_A: "alloy",
  HOST_B: "onyx",
};

export async function synthesizeEpisode(script: ScriptLine[]): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for (const line of script) {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: VOICE_MAP[line.speaker],
      input: line.text,
      response_format: "mp3",
    });
    const arrayBuffer = await mp3.arrayBuffer();
    chunks.push(Buffer.from(arrayBuffer));
  }

  // NOTE: naive MP3 concatenation. This plays back fine in virtually all
  // browsers/players, but for perfectly gapless, re-encoded output at scale,
  // pipe these buffers through ffmpeg's concat instead, e.g.:
  //   ffmpeg -i "concat:part1.mp3|part2.mp3|..." -acodec copy out.mp3
  return Buffer.concat(chunks);
}

// Rough duration estimate for display purposes (actual mp3 duration would
// need to be probed with ffprobe if you want it exact).
export function estimateDurationSec(script: ScriptLine[]): number {
  const totalWords = script.reduce((sum, l) => sum + l.text.split(/\s+/).length, 0);
  return Math.round((totalWords / 140) * 60);
}
