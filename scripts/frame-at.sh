#!/usr/bin/env bash
# Saves one frame of a video at an exact time, e.g. just after a click, to see a toast or dialog
# that the periodic sampling of extract-frames.sh may have missed.
#
# Usage: scripts/frame-at.sh <video> <seconds> [out.jpg]
#   out.jpg  default: <video dir>/frames-at/at_<seconds>.jpg
# Requires ffmpeg. Prints the output path. The video is only read.
set -euo pipefail

video="${1:-}"
secs="${2:-}"
if [[ -z "$video" || -z "$secs" || ! -f "$video" ]]; then
  echo "Usage: $0 <video> <seconds> [out.jpg]" >&2
  exit 2
fi
if ! [[ "$secs" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
  echo "seconds must be a non-negative number, got '$secs'" >&2
  exit 2
fi
command -v ffmpeg >/dev/null 2>&1 || {
  echo "ffmpeg not found. Install it (macOS: brew install ffmpeg) and retry." >&2
  exit 3
}

out="${3:-$(dirname "$video")/frames-at/at_${secs}.jpg}"
mkdir -p "$(dirname "$out")"
ffmpeg -v error -y -ss "$secs" -i "$video" -frames:v 1 -vf "scale='min(1280,iw)':-2" -q:v 4 "$out"
[[ -s "$out" ]] || { echo "no frame at ${secs}s (past the end of the video?)" >&2; exit 4; }
echo "$out"
