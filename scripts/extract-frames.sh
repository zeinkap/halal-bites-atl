#!/usr/bin/env bash
# Extracts keyframes from a screen recording so an agent can read them as images.
#
# Usage: scripts/extract-frames.sh <video> [outdir] [max_frames]
#   outdir      default: recordings/.frames/<video name> (gitignored)
#   max_frames  default: 40; frames are thinned evenly if there are more
#
# A frame is kept when the screen changes (scene score > 0.01) or at least 2s passed since the
# last kept frame, so quiet stretches are still sampled. The final frame is always included.
# Writes frame_NNN.jpg (max 1280px wide) and index.tsv ("file<TAB>seconds"), in time order.
# Requires ffmpeg and ffprobe (macOS: brew install ffmpeg). The video is only read, never changed.
set -euo pipefail

video="${1:-}"
if [[ -z "$video" || ! -f "$video" ]]; then
  echo "Usage: $0 <video> [outdir] [max_frames]" >&2
  exit 2
fi
for tool in ffmpeg ffprobe; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "$tool not found. Install ffmpeg (macOS: brew install ffmpeg) and retry." >&2
    exit 3
  }
done

name="$(basename "${video%.*}")"
out="${2:-recordings/.frames/$name}"
max="${3:-40}"

duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")"
rm -rf "$out"
mkdir -p "$out"

# Main pass: scene changes, or >= 2s since the last kept frame. showinfo logs each frame's time.
ffmpeg -v info -i "$video" \
  -vf "select='isnan(prev_selected_t)+gt(scene,0.01)+gte(t-prev_selected_t,2)',scale='min(1280,iw)':-2,showinfo" \
  -fps_mode vfr -q:v 4 "$out/frame_%03d.jpg" 2> "$out/.ffmpeg.log" || {
  echo "ffmpeg failed; see $out/.ffmpeg.log" >&2
  exit 4
}

grep -o 'pts_time:[0-9.]*' "$out/.ffmpeg.log" | cut -d: -f2 > "$out/.times"
n="$(find "$out" -name 'frame_*.jpg' | wc -l | tr -d ' ')"

# Always include the last frame (final state), unless a frame already sits within 0.5s of the end.
last_kept="$(tail -n1 "$out/.times" 2>/dev/null || echo 0)"
if awk -v d="$duration" -v l="$last_kept" 'BEGIN { exit !(d - l > 0.5) }'; then
  n=$((n + 1))
  printf -v last_file "frame_%03d.jpg" "$n"
  if ffmpeg -v error -sseof -0.3 -i "$video" -frames:v 1 \
      -vf "scale='min(1280,iw)':-2" -q:v 4 "$out/$last_file" 2>/dev/null && [[ -f "$out/$last_file" ]]; then
    awk -v d="$duration" 'BEGIN { printf "%.2f\n", d }' >> "$out/.times"
  else
    n=$((n - 1))
  fi
fi

# Index in time order.
i=0
: > "$out/index.tsv"
while read -r t; do
  i=$((i + 1))
  printf 'frame_%03d.jpg\t%s\n' "$i" "$t" >> "$out/index.tsv"
done < "$out/.times"

# Thin evenly if over the cap (keeps first and last).
if (( n > max )); then
  keep="$(awk -v n="$n" -v m="$max" 'BEGIN { for (k = 0; k < m; k++) printf "%d\n", int(k * (n - 1) / (m - 1)) + 1 }' | sort -un)"
  awk -v keep="$keep" 'BEGIN { split(keep, a, "\n"); for (k in a) want[a[k]] = 1 } NR in want' "$out/index.tsv" > "$out/.kept"
  for f in "$out"/frame_*.jpg; do
    grep -q "^$(basename "$f")	" "$out/.kept" || rm -f "$f"
  done
  mv "$out/.kept" "$out/index.tsv"
fi

rm -f "$out/.times"
echo "duration=${duration}s frames=$(wc -l < "$out/index.tsv" | tr -d ' ') dir=$out"
