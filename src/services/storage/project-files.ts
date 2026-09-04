import { createHash, randomUUID } from "crypto";
import { mkdir, copyFile, access, writeFile, readFile } from "fs/promises";
import path from "path";
import { constants } from "fs";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "projects");

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
}

export function getProjectDir(projectId: string): string {
  return path.join(STORAGE_ROOT, safeSegment(projectId));
}

export function getScenesDir(projectId: string): string {
  return path.join(getProjectDir(projectId), "scenes");
}

export async function ensureScenesDir(projectId: string): Promise<string> {
  const dir = getScenesDir(projectId);
  await mkdir(dir, { recursive: true });
  return dir;
}

export function sceneImageFilename(sceneNumber: number): string {
  return `scene-${String(sceneNumber).padStart(2, "0")}.png`;
}

export function getSceneImageAbsolutePath(
  projectId: string,
  sceneNumber: number
): string {
  return path.join(getScenesDir(projectId), sceneImageFilename(sceneNumber));
}

export function getSceneImagePublicUrl(
  projectId: string,
  sceneNumber: number,
  bust?: number | string
): string {
  const base = `/api/media/projects/${encodeURIComponent(safeSegment(projectId))}/scenes/${sceneImageFilename(sceneNumber)}`;
  return bust != null ? `${base}?v=${bust}` : base;
}

export async function saveSceneImageFromPath(input: {
  projectId: string;
  sceneNumber: number;
  sourcePath: string;
}): Promise<{ absolutePath: string; publicUrl: string }> {
  const dir = await ensureScenesDir(input.projectId);
  const absolutePath = path.join(dir, sceneImageFilename(input.sceneNumber));
  await copyFile(input.sourcePath, absolutePath);
  return {
    absolutePath,
    publicUrl: getSceneImagePublicUrl(
      input.projectId,
      input.sceneNumber,
      Date.now()
    ),
  };
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve a media path under storage/projects only (path traversal safe).
 */
export function resolveProjectMediaPath(
  projectId: string,
  relativePath: string
): string | null {
  const cleaned = relativePath.replace(/^\/+/, "");
  if (cleaned.includes("..") || path.isAbsolute(cleaned)) return null;
  const root = getProjectDir(projectId);
  const full = path.resolve(root, cleaned);
  if (!full.startsWith(path.resolve(root) + path.sep) && full !== path.resolve(root)) {
    return null;
  }
  return full;
}

export async function writeJsonMeta(
  projectId: string,
  name: string,
  data: unknown
): Promise<void> {
  const dir = await ensureScenesDir(projectId);
  const file = path.join(path.dirname(dir), `${safeSegment(name)}.json`);
  await writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export async function readJsonMeta<T>(
  projectId: string,
  name: string
): Promise<T | null> {
  try {
    const file = path.join(
      getProjectDir(projectId),
      `${safeSegment(name)}.json`
    );
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function createSceneId(projectId: string, sceneNumber: number): string {
  const hash = createHash("sha1")
    .update(`${projectId}:${sceneNumber}`)
    .digest("hex")
    .slice(0, 12);
  return `scn_${sceneNumber}_${hash}`;
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2_147_483_646);
}

export function ensureUuid(): string {
  return randomUUID();
}
