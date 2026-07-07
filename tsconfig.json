import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type LengthMode = "short" | "medium" | "long";

// Rough spoken-word rate is ~140 words/minute for a natural two-person
// conversation. These targets map directly to the "length toggle" in the UI.
const LENGTH_TARGETS: Record<LengthMode, { minutes: number; words: number }> = {
  short: { minutes: 3, words: 420 },
  medium: { minutes: 7, words: 980 },
  long: { minutes: 15, words: 2100 },
};

export interface ScriptLine {
  speaker: "HOST_A" | "HOST_B";
  text: string;
}

export async function generatePodcastScript(
  sourceText: string,
  lengthMode: LengthMode
): Promise<ScriptLine[]> {
  const target = LENGTH_TARGETS[lengthMode];

  const prompt = `You are writing a two-host podcast script that discusses the document below.

Rules:
- Two hosts: HOST_A (curious, asks questions, drives the conversation) and HOST_B (the expert, explains and adds context).
- Natural, conversational tone — contractions, occasional short interjections, no stiff "as an AI" phrasing.
- Cover the key ideas in the document; do not invent facts not supported by it.
- Target length: approximately ${target.words} words total (about ${target.minutes} minutes spoken).
- Output ONLY a JSON array of objects like {"speaker": "HOST_A", "text": "..."} — no markdown fences, no commentary before or after.

DOCUMENT:
"""
${sourceText}
"""`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  let script: ScriptLine[];
  try {
    script = JSON.parse(cleaned);
  } catch {
    throw new Error("Model didn't return valid script JSON — try again.");
  }

  return script;
}
