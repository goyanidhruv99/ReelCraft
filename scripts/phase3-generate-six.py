#!/usr/bin/env python3
"""Generate 6 test scene images sequentially against the local image service."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path("/Users/monali/Documents/ReelCraft")
SERVER = ROOT / "tools" / "image-server" / "server.py"
PY = Path.home() / "miniforge3" / "envs" / "reelcraft-img" / "bin" / "python"
OUT = ROOT / "storage" / "projects" / "phase3-hindi-test" / "scenes"
LOG = Path("/tmp/reelcraft-image-server.log")
BASE = "http://127.0.0.1:8188"
OUT.mkdir(parents=True, exist_ok=True)

PROMPTS = [
    "Poor Indian teenage boy in village courtyard at sunrise, hopeful, worn clothes, cinematic illustration, vertical portrait",
    "Slim Indian teenage boy carrying goods in dusty marketplace, determined, warm daylight, cinematic illustration, vertical portrait",
    "Boy studying at wooden desk under warm bulb, father sleeping nearby, night, cinematic illustration, vertical portrait",
    "Boy facing closed shop door in rainy town evening, emotional, cinematic illustration, vertical portrait",
    "Boy opens small new shop with proud elderly father, soft golden light, cinematic illustration, vertical portrait",
    "Boy and father embrace outside successful small business at dusk, emotional ending, cinematic illustration, vertical portrait",
]
NEG = "text, subtitle, watermark, logo, distorted face, deformed hands, extra fingers, low quality, blurry"


def stop_server() -> None:
    subprocess.run(["pkill", "-f", "image-server/server.py"], check=False)
    time.sleep(2)


def start_server() -> None:
    stop_server()
    env = os.environ.copy()
    env["REELCRAFT_IMAGE_OUTPUT"] = str(ROOT / "storage" / "generated")
    env["REELCRAFT_IMAGE_HOST"] = "127.0.0.1"
    env["REELCRAFT_IMAGE_PORT"] = "8188"
    env["REELCRAFT_IMAGE_STEPS"] = "18"
    LOG.write_text("")
    subprocess.Popen(
        [str(PY), "-u", str(SERVER)],
        cwd=str(SERVER.parent),
        env=env,
        stdout=open(LOG, "a"),
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"{BASE}/health", timeout=2) as res:
                if res.status == 200:
                    return
        except Exception:
            time.sleep(1)
    raise RuntimeError("Image server failed to start")


def post(path: str, payload: dict, timeout: int = 360) -> dict:
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))


def main() -> None:
    start_server()
    # Warmup so first timed gen is fair
    print("warmup...", flush=True)
    post("/warmup", {}, timeout=180)
    times: list[int] = []

    for i, prompt in enumerate(PROMPTS, start=1):
        print(f"=== Scene {i} ===", flush=True)
        data = post(
            "/generate",
            {
                "prompt": prompt,
                "negative_prompt": NEG,
                "width": 576,
                "height": 1024,
                "seed": 3000 + i,
                "steps": 18,
                "filename": f"scene-{i:02d}-raw.png",
            },
        )
        assert data.get("success"), data
        src = Path(data["image_path"])
        dst = OUT / f"scene-{i:02d}.png"
        shutil.copy(src, dst)
        im = Image.open(dst)
        assert im.size == (576, 1024), im.size
        assert dst.stat().st_size > 50_000, dst.stat().st_size
        ms = int(data.get("generation_time_ms") or 0)
        times.append(ms)
        print(f"saved {dst} bytes={dst.stat().st_size} ms={ms}", flush=True)

    print("ALL_SIX_OK", flush=True)
    print("avg_ms", int(sum(times) / len(times)), flush=True)
    print("times_ms", times, flush=True)


if __name__ == "__main__":
    try:
        main()
    finally:
        # Leave server running for the app; do not kill here.
        pass
