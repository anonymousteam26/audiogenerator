import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const episode = await db.episode.findUnique({ where: { id: params.id } });
  if (!episode) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ episode });
}
