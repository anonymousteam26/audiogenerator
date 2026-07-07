import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Anonymous public history: everyone sees everyone's generated episodes.
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
