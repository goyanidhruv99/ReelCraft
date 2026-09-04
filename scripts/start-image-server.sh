#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMG_DIR="$ROOT/tools/image-server"
PY="${HOME}/miniforge3/envs/reelcraft-img/bin/python"

if [[ ! -x "$PY" ]]; then
  echo "Missing reelcraft-img Python env at $PY"
  echo "Create it with: conda create -n reelcraft-img python=3.11 && pip install -r tools/image-server/requirements.txt"
  exit 1
fi

export REELCRAFT_IMAGE_HOST="${REELCRAFT_IMAGE_HOST:-127.0.0.1}"
export REELCRAFT_IMAGE_PORT="${REELCRAFT_IMAGE_PORT:-8188}"
export REELCRAFT_IMAGE_MODEL="${REELCRAFT_IMAGE_MODEL:-stable-diffusion-v1-5/stable-diffusion-v1-5}"
export REELCRAFT_IMAGE_WIDTH="${REELCRAFT_IMAGE_WIDTH:-576}"
export REELCRAFT_IMAGE_HEIGHT="${REELCRAFT_IMAGE_HEIGHT:-1024}"
export REELCRAFT_IMAGE_OUTPUT="${REELCRAFT_IMAGE_OUTPUT:-$ROOT/storage/generated}"
export IMAGE_SERVICE_URL="http://${REELCRAFT_IMAGE_HOST}:${REELCRAFT_IMAGE_PORT}"

mkdir -p "$REELCRAFT_IMAGE_OUTPUT"
cd "$IMG_DIR"
exec "$PY" server.py
