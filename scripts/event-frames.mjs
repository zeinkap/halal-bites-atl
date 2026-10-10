#!/usr/bin/env node
// Extracts frames at the moments that matter in a recording made by `npm run record`: shortly
// after each recorded action, when its result is on screen (a toast, a dialog opening or closing,
// a list updating). Periodic sampling (extract-frames.sh) can miss these; the event log says
// exactly when they happen.
//
// Usage: node scripts/event-frames.mjs <recordings/name> [--max 60]
// Writes <dir>/event-frames/at_<seconds>.jpg and index.tsv ("file<TAB>seconds<TAB>label").
// Requires ffmpeg. Reads events.jsonl and meta.json; never changes the video.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
const maxIdx = args.indexOf('--max');
const max = maxIdx >= 0 ? Number(args[maxIdx + 1]) : 60;
if (!dir || !fs.existsSync(path.join(dir, 'events.jsonl')) || !fs.existsSync(path.join(dir, 'recording.webm'))) {
  console.error('Usage: node scripts/event-frames.mjs <recordings/name> [--max 60]\n(needs recording.webm and events.jsonl)');
  process.exit(2);
}
try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('ffmpeg not found. Install it (macOS: brew install ffmpeg) and retry.');
  process.exit(3);
}

const meta = fs.existsSync(path.join(dir, 'meta.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')) : {};
const duration = meta.durationSec ?? Infinity;
const events = fs
  .readFileSync(path.join(dir, 'events.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));

const quote = (s) => (s ? ` "${String(s).slice(0, 40)}"` : '');
const describe = (e) => {
  const who = quote(e.target?.name || e.target?.testid || e.target?.placeholder);
  if (e.type === 'ui') return `${e.kind} appeared${quote(e.text)}`;
  if (e.type === 'input') return `typed${quote(typeof e.value === 'string' ? e.value : '')} into${who}`;
  if (e.type === 'key') return `pressed ${e.key} in${who}`;
  if (e.type === 'navigate') return `navigated to ${e.url}`;
  return `${e.type}${who}`;
};

// Moments after which the result of an action is visible: soon after, and once things settle.
const OFFSETS = { click: [0.4, 1.5], submit: [0.4, 1.5], navigate: [0.5, 1.5], ui: [0.3], input: [0.3], key: [0.4, 1.2], change: [0.3] };
const candidates = [];
for (const e of events) {
  for (const off of OFFSETS[e.type] ?? []) {
    candidates.push({ t: Math.round((e.t + off) * 10) / 10, label: `${off}s after ${describe(e)} (at ${e.t}s)` });
  }
}
candidates.push({ t: Math.max(0, Math.round((duration - 0.2) * 10) / 10), label: 'final moment' });
candidates.sort((a, b) => a.t - b.t);

// Drop frames closer than 0.3s to the previous one, and anything past the end of the video.
let kept = [];
for (const c of candidates) {
  if (c.t > duration - 0.05) continue;
  if (kept.length && c.t - kept[kept.length - 1].t < 0.3) continue;
  kept.push(c);
}
if (kept.length > max) {
  const step = (kept.length - 1) / (max - 1);
  kept = Array.from({ length: max }, (_, i) => kept[Math.round(i * step)]);
}

const out = path.join(dir, 'event-frames');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const rows = [];
for (const c of kept) {
  const file = `at_${c.t.toFixed(1)}.jpg`;
  try {
    execFileSync(
      'ffmpeg',
      ['-v', 'error', '-y', '-ss', String(c.t), '-i', path.join(dir, 'recording.webm'), '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", '-q:v', '4', path.join(out, file)],
      { stdio: 'ignore' },
    );
    if (fs.statSync(path.join(out, file)).size > 0) rows.push(`${file}\t${c.t}\t${c.label}`);
  } catch {
    /* no frame at that time; skip */
  }
}
fs.writeFileSync(path.join(out, 'index.tsv'), rows.join('\n') + (rows.length ? '\n' : ''));
console.log(`event-frames=${rows.length} dir=${out}`);
