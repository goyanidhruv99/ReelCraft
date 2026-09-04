import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { resolveProjectMediaPath } from "@/services/storage/project-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const { projectId, path: parts } = await context.params;
  if (!projectId || !parts?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const relative = parts.join("/");
  const absolute = resolveProjectMediaPath(projectId, relative);
  if (!absolute) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const data = await readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const type =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
