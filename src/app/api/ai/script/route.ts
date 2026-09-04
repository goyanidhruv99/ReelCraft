import { NextResponse } from "next/server";
import {
  generateStructuredScript,
  OllamaError,
} from "@/services/ai";
import type { ScriptGenerateRequest } from "@/types/script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function userMessageFromError(error: unknown): string {
  if (error instanceof OllamaError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    if (/not running|ECONNREFUSED|fetch failed/i.test(error.message)) {
      return "Local AI is not running. Start Ollama and try again.";
    }
  }
  return "Script generation failed. Please try again.";
}

export async function POST(request: Request) {
  let body: Partial<ScriptGenerateRequest>;

  try {
    body = (await request.json()) as Partial<ScriptGenerateRequest>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const idea = String(body.idea || "").trim();
  if (!idea) {
    return NextResponse.json(
      { error: "Enter a video idea before generating." },
      { status: 400 }
    );
  }

  const payload: ScriptGenerateRequest = {
    idea,
    language: String(body.language || "hi"),
    style: String(body.style || "cinematic"),
    durationSeconds: Number(body.durationSeconds) || 60,
    topic: body.topic ? String(body.topic) : undefined,
  };

  try {
    const script = await generateStructuredScript(payload);
    return NextResponse.json({ script });
  } catch (error) {
    const message = userMessageFromError(error);
    const status =
      error instanceof OllamaError && error.code === "model_missing"
        ? 503
        : error instanceof OllamaError && error.code === "not_running"
          ? 503
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
