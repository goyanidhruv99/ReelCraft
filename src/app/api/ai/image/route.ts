import { NextResponse } from "next/server";
import {
  generateLocalImage,
  getImageServiceConfig,
  ImageServiceError,
} from "@/services/ai/image-generator";
import {
  createSceneId,
  newSeed,
  saveSceneImageFromPath,
} from "@/services/storage/project-files";
import { DEFAULT_NEGATIVE_PROMPT } from "@/services/ai/image-prompt-builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface Body {
  projectId?: string;
  sceneId?: string;
  sceneNumber?: number;
  prompt?: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}

function userMessage(error: unknown): string {
  if (error instanceof ImageServiceError) return error.message;
  return "Image generation failed. Please try again.";
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const projectId = String(body.projectId || "").trim();
  const prompt = String(body.prompt || "").trim();
  const sceneNumber = Number(body.sceneNumber);

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required." }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required." }, { status: 400 });
  }
  if (!Number.isFinite(sceneNumber) || sceneNumber < 1) {
    return NextResponse.json(
      { error: "sceneNumber must be a positive number." },
      { status: 400 }
    );
  }

  const defaults = getImageServiceConfig();
  const width = Number(body.width) || defaults.width;
  const height = Number(body.height) || defaults.height;
  const seed =
    body.seed != null && Number.isFinite(Number(body.seed))
      ? Number(body.seed)
      : newSeed();
  const sceneId =
    String(body.sceneId || "").trim() || createSceneId(projectId, sceneNumber);

  try {
    const generated = await generateLocalImage({
      prompt,
      negativePrompt: body.negativePrompt || DEFAULT_NEGATIVE_PROMPT,
      width,
      height,
      seed,
      filename: `${projectId}-scene-${sceneNumber}-${seed}.png`,
    });

    const saved = await saveSceneImageFromPath({
      projectId,
      sceneNumber,
      sourcePath: generated.imagePath,
    });

    return NextResponse.json({
      success: true,
      image: {
        path: saved.absolutePath,
        url: saved.publicUrl,
        width: generated.width,
        height: generated.height,
        seed: generated.seed ?? seed,
        generationTimeMs: generated.generationTimeMs,
        sceneId,
      },
    });
  } catch (error) {
    const message = userMessage(error);
    const status =
      error instanceof ImageServiceError && error.code === "not_running"
        ? 503
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
