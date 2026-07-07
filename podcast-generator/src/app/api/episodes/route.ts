import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Anonymous public history: everyone sees everyone's generated episodes.
// This is a deliberate product choice for "public documents" - if you
// later want per-user history, filter by ipHash (weak) or add real auth
// and filter by userId instead.
export async function GET() {
  const episodes = await db.episode.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      sourceName: true,
      lengthMode: true,
      status: true,
      audioUrl: true,
      durationSec: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ episodes });
}
