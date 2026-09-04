import { NextResponse } from "next/server";
import { getImageServiceHealth } from "@/services/ai/image-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getImageServiceHealth();
  return NextResponse.json(health, {
    status: health.available ? 200 : 503,
  });
}
