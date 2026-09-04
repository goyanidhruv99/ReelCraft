import { NextResponse } from "next/server";
import { getAiHealth } from "@/services/ai/ollama-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getAiHealth();
  return NextResponse.json(
    {
      available: health.available,
      ollama: health.ollama,
      model: health.model,
      modelInstalled: health.modelInstalled,
      code: health.code,
      message: health.message,
    },
    { status: health.available ? 200 : 503 }
  );
}
