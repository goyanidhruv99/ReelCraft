"""
ReelCraft local image generation service (Apple Silicon / MPS).

Runs on localhost only. Used by the Next.js backend — not by the browser.
"""

from __future__ import annotations

import os
import threading
import time
import uuid
from pathlib import Path
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

HOST = os.environ.get("REELCRAFT_IMAGE_HOST", "127.0.0.1")
PORT = int(os.environ.get("REELCRAFT_IMAGE_PORT", "8188"))
MODEL_ID = os.environ.get(
    "REELCRAFT_IMAGE_MODEL",
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
)
DEFAULT_WIDTH = int(os.environ.get("REELCRAFT_IMAGE_WIDTH", "576"))
DEFAULT_HEIGHT = int(os.environ.get("REELCRAFT_IMAGE_HEIGHT", "1024"))
DEFAULT_STEPS = int(os.environ.get("REELCRAFT_IMAGE_STEPS", "18"))
DEFAULT_GUIDANCE = float(os.environ.get("REELCRAFT_IMAGE_GUIDANCE", "7.0"))
MIN_PNG_BYTES = 40_000

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = Path(
    os.environ.get(
        "REELCRAFT_IMAGE_OUTPUT",
        str(ROOT.parent.parent / "storage" / "generated"),
    )
)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="ReelCraft Image Service", version="0.1.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_pipe = None
_load_error: Optional[str] = None
_device = "cpu"
_gen_lock = threading.Lock()
_busy = False


def _select_device() -> str:
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def _clear_mps() -> None:
    if _device != "mps":
        return
    try:
        torch.mps.synchronize()
        torch.mps.empty_cache()
    except Exception:
        pass


def get_pipeline():
    global _pipe, _load_error, _device
    if _pipe is not None:
        return _pipe
    if _load_error:
        raise RuntimeError(_load_error)

    try:
        from diffusers import DPMSolverMultistepScheduler, StableDiffusionPipeline

        _device = _select_device()
        dtype = torch.float16 if _device == "mps" else torch.float32

        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_ID,
            dtype=dtype,
            safety_checker=None,
            requires_safety_checker=False,
        )
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
        pipe = pipe.to(_device)
        pipe.enable_attention_slicing()
        try:
            pipe.enable_vae_slicing()
        except Exception:
            pass

        _pipe = pipe
        return _pipe
    except Exception as exc:  # noqa: BLE001
        _load_error = str(exc)
        raise


def _truncate_prompt(pipe, text: str, max_tokens: int = 75) -> str:
    text = (text or "").strip()
    if not text:
        return ""
    tokenizer = getattr(pipe, "tokenizer", None)
    if tokenizer is None:
        return text[:400]
    tokens = tokenizer(
        text,
        truncation=True,
        max_length=max_tokens,
        return_tensors=None,
    )
    return tokenizer.decode(tokens["input_ids"], skip_special_tokens=True).strip()


def _validate_png(path: Path, width: int, height: int) -> None:
    from PIL import Image
    import statistics

    if not path.exists() or path.stat().st_size < MIN_PNG_BYTES:
        raise RuntimeError(
            f"Generated image looks corrupt or empty ({path.stat().st_size if path.exists() else 0} bytes)."
        )
    with Image.open(path) as im:
        im.load()
        if im.size != (width, height):
            raise RuntimeError(f"Unexpected image size {im.size}, expected {(width, height)}.")
        # Sample pixels — reject near-blank frames from failed MPS runs
        sample = list(im.resize((32, 32)).getdata())
        if not sample:
            raise RuntimeError("Generated image has no pixel data.")
        means = [sum(px[:3]) / 3 for px in sample]
        if statistics.pstdev(means) < 1.5:
            raise RuntimeError("Generated image appears blank or uniform.")


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    negative_prompt: Optional[str] = Field(default=None, max_length=4000)
    width: int = Field(default=DEFAULT_WIDTH, ge=256, le=1024)
    height: int = Field(default=DEFAULT_HEIGHT, ge=256, le=1280)
    seed: Optional[int] = None
    steps: int = Field(default=DEFAULT_STEPS, ge=4, le=40)
    guidance_scale: float = Field(default=DEFAULT_GUIDANCE, ge=1.0, le=15.0)
    filename: Optional[str] = None


class GenerateResponse(BaseModel):
    success: bool
    image_path: str
    width: int
    height: int
    seed: int
    generation_time_ms: int
    model: str
    device: str


class HealthResponse(BaseModel):
    available: bool
    engine: str
    model: str
    model_loaded: bool
    device: str
    default_width: int
    default_height: int
    busy: bool
    message: str


@app.get("/health", response_model=HealthResponse)
def health():
    device = _select_device()
    loaded = _pipe is not None
    ok = _load_error is None
    message = (
        "Local image service ready."
        if ok
        else f"Image model failed to load: {_load_error}"
    )
    if ok and not loaded:
        message = "Local image service online. Model loads on first generation."
    if _busy:
        message = "Local image service busy generating."
    return HealthResponse(
        available=ok,
        engine="diffusers-mps",
        model=MODEL_ID,
        model_loaded=loaded,
        device=device,
        default_width=DEFAULT_WIDTH,
        default_height=DEFAULT_HEIGHT,
        busy=_busy,
        message=message,
    )


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    global _busy

    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    width = max(256, (req.width // 8) * 8)
    height = max(256, (req.height // 8) * 8)
    seed = req.seed if req.seed is not None else int(uuid.uuid4().int % (2**31 - 1))

    acquired = _gen_lock.acquire(blocking=False)
    if not acquired:
        raise HTTPException(
            status_code=503,
            detail="Image service is busy. Wait for the current generation to finish.",
        )

    _busy = True
    try:
        try:
            pipe = get_pipeline()
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=503,
                detail=f"Required local image model is not available: {exc}",
            ) from exc

        prompt = _truncate_prompt(pipe, prompt, 75)
        negative = _truncate_prompt(pipe, req.negative_prompt or "", 75)
        generator = torch.Generator(device="cpu").manual_seed(seed)
        started = time.perf_counter()

        try:
            with torch.inference_mode():
                result = pipe(
                    prompt=prompt,
                    negative_prompt=negative,
                    width=width,
                    height=height,
                    num_inference_steps=req.steps,
                    guidance_scale=req.guidance_scale,
                    generator=generator,
                )
            image = result.images[0]
        except Exception as exc:  # noqa: BLE001
            _clear_mps()
            raise HTTPException(
                status_code=500,
                detail=f"Image generation failed: {exc}",
            ) from exc
        finally:
            _clear_mps()

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        name = req.filename or f"scene-{seed}-{uuid.uuid4().hex[:8]}.png"
        name = Path(name).name
        if not name.lower().endswith(".png"):
            name = f"{name}.png"

        out_path = OUTPUT_DIR / name
        image.save(out_path, format="PNG")
        try:
            _validate_png(out_path, width, height)
        except Exception as exc:  # noqa: BLE001
            try:
                out_path.unlink(missing_ok=True)
            except Exception:
                pass
            raise HTTPException(
                status_code=500,
                detail=f"Image generation failed validation: {exc}",
            ) from exc

        return GenerateResponse(
            success=True,
            image_path=str(out_path),
            width=width,
            height=height,
            seed=seed,
            generation_time_ms=elapsed_ms,
            model=MODEL_ID,
            device=_device,
        )
    finally:
        _busy = False
        _gen_lock.release()


@app.post("/warmup")
def warmup():
    try:
        get_pipeline()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"ok": True, "model": MODEL_ID, "device": _device}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
