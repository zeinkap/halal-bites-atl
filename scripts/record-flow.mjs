#!/usr/bin/env node
// Records a manual run-through of the app for /record-to-test: the screen video PLUS what the
// video cannot show (which element was clicked, the exact typed values, toasts and dialogs that
// appear, and which API calls fired).
//
// Usage:  npm run record -- [name] [--url http://localhost:3000] [--viewport 1280x720]
//                           [--storage-state file.json] [--no-prompt] [--no-cursor] [--headless]
//
// Start the app first, against the test database, so the data matches what tests will see:
//   npx dotenv -e .env.test -e .env -- npm run dev
// A browser window opens. Do the flow, then close the window (or press Enter in this terminal).
// The video shows a blue dot for the pointer and a red ring where you click (--no-cursor to turn
// that off), because a screen video of the page does not otherwise show the mouse.
//
// Output, in recordings/<name>/ (gitignored: it can contain personal data):
//   recording.webm  screen video
//   events.jsonl    one JSON object per line: clicks, typed/selected values, key presses,
//                   navigations, UI messages (status/alert/dialog text), page errors
//   network.json    API calls (fetch/xhr/document): method, path, query keys, status, body keys
//   intake.md       your answers to the questions asked at the start
//   meta.json       url, viewport, duration, git sha
// Times are seconds since the page opened; the video starts at about the same moment.
//
// Privacy: password fields are never captured. Network bodies are NOT saved, only JSON key
// names. Anything you type is visible in the video and in events.jsonl, so use test data, and
// for admin flows load a saved login with --storage-state instead of typing a password.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { pathToFileURL } from 'node:url';

/**
 * Runs in every page. Reports user actions to Node through the __recEvent binding, and (unless
 * disabled) draws a pointer dot and a click ring: Playwright's video shows the page only, not the
 * mouse, so without these the frames cannot show where a click landed.
 */
function pageScript(opts) {
  if (window.__recInstalled) return;
  window.__recInstalled = true;
  if (opts?.cursor) {
    const mount = () => {
      const base = { position: 'fixed', zIndex: '2147483647', pointerEvents: 'none', transform: 'translate(-50%, -50%)' };
      const dot = document.createElement('div');
      Object.assign(dot.style, base, {
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        background: 'rgba(37, 99, 235, 0.85)',
        border: '2px solid #fff',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.45)',
        left: '-30px',
        top: '-30px',
      });
      document.documentElement.appendChild(dot);
      document.addEventListener(
        'mousemove',
        (e) => {
          dot.style.left = e.clientX + 'px';
          dot.style.top = e.clientY + 'px';
        },
        true,
      );
      document.addEventListener(
        'mousedown',
        (e) => {
          dot.style.left = e.clientX + 'px';
          dot.style.top = e.clientY + 'px';
          const ring = document.createElement('div');
          Object.assign(ring.style, base, {
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '4px solid rgba(220, 38, 38, 0.9)',
            left: e.clientX + 'px',
            top: e.clientY + 'px',
          });
          document.documentElement.appendChild(ring);
          const anim = ring.animate(
            [
              { opacity: 1, transform: 'translate(-50%, -50%) scale(0.6)' },
              { opacity: 0, transform: 'translate(-50%, -50%) scale(1.6)' },
            ],
            { duration: 1100, easing: 'ease-out' },
          );
          anim.onfinish = () => ring.remove();
        },
        true,
      );
    };
    if (document.documentElement) mount();
    else document.addEventListener('DOMContentLoaded', mount);
  }
  const send = (payload) => {
    try {
      window.__recEvent(payload);
    } catch {
      /* binding not ready yet */
    }
  };
  const clip = (s, n = 120) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const implicitRole = (el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'a') return 'link';
    if (tag === 'button') return 'button';
    if (tag === 'select') return 'combobox';
    if (tag === 'textarea') return 'textbox';
    if (tag === 'input') {
      const t = (el.getAttribute('type') || 'text').toLowerCase();
      if (t === 'checkbox') return 'checkbox';
      if (t === 'radio') return 'radio';
      if (['button', 'submit', 'reset'].includes(t)) return 'button';
      return 'textbox';
    }
    return null;
  };
  const labelOf = (el) => {
    const aria = el.getAttribute('aria-label');
    if (aria) return clip(aria);
    const by = el.getAttribute('aria-labelledby');
    if (by) {
      const t = by.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ');
      if (clip(t)) return clip(t);
    }
    if (el.labels && el.labels.length) return clip(el.labels[0].textContent);
    return '';
  };
  const describe = (raw) => {
    const el =
      raw.closest?.('button,a,[role=button],[role=tab],[role=menuitem],[role=option],label,summary,input,select,textarea') ||
      raw;
    const type = (el.getAttribute?.('type') || '').toLowerCase();
    const d = {
      tag: el.tagName?.toLowerCase(),
      role: el.getAttribute?.('role') || implicitRole(el),
      name: labelOf(el) || (['INPUT', 'TEXTAREA', 'SELECT', 'FORM'].includes(el.tagName) ? '' : clip(el.textContent, 80)),
      testid: el.getAttribute?.('data-testid') || null,
      placeholder: el.getAttribute?.('placeholder') || null,
      type: type || null,
      id: el.id || null,
    };
    for (const k of Object.keys(d)) if (d[k] === null || d[k] === '') delete d[k];
    return d;
  };
  const valueOf = (el) => {
    const type = (el.getAttribute?.('type') || '').toLowerCase();
    if (type === 'password') return '<redacted>';
    if (type === 'checkbox' || type === 'radio') return { checked: el.checked };
    if (el.tagName === 'SELECT') return { value: el.value, label: clip(el.selectedOptions?.[0]?.textContent) };
    if (type === 'file') return { files: Array.from(el.files || []).map((f) => f.name) };
    return el.value;
  };

  document.addEventListener('click', (e) => send({ type: 'click', target: describe(e.target) }), true);

  // Typing: report the final value once the user pauses or leaves the field.
  const timers = new WeakMap();
  const lastSent = new WeakMap();
  const reportValue = (el) => {
    const v = valueOf(el);
    if (JSON.stringify(lastSent.get(el)) === JSON.stringify(v)) return;
    lastSent.set(el, v);
    send({ type: 'input', target: describe(el), value: v });
  };
  document.addEventListener(
    'input',
    (e) => {
      const el = e.target;
      if (!el || !['INPUT', 'TEXTAREA'].includes(el.tagName)) return;
      const t = (el.getAttribute('type') || '').toLowerCase();
      if (['checkbox', 'radio', 'file'].includes(t)) return;
      clearTimeout(timers.get(el));
      timers.set(el, setTimeout(() => reportValue(el), 700));
    },
    true,
  );
  document.addEventListener(
    'change',
    (e) => {
      const el = e.target;
      if (!el?.tagName) return;
      clearTimeout(timers.get(el));
      reportValue(el);
    },
    true,
  );
  document.addEventListener(
    'keydown',
    (e) => {
      if (['Enter', 'Escape', 'Tab'].includes(e.key)) {
        const el = e.target;
        if (['INPUT', 'TEXTAREA'].includes(el?.tagName)) {
          clearTimeout(timers.get(el));
          reportValue(el);
        }
        send({ type: 'key', key: e.key, target: describe(e.target) });
      }
    },
    true,
  );
  document.addEventListener('submit', (e) => send({ type: 'submit', target: describe(e.target) }), true);

  // Messages that appear (toasts, alerts, dialogs): often the expected result, and transient.
  const announce = (node) => {
    if (node.nodeType !== 1) return;
    const hit = node.matches?.('[role=status],[role=alert],[role=dialog],[aria-modal=true]')
      ? node
      : node.querySelector?.('[role=status],[role=alert],[role=dialog],[aria-modal=true]');
    if (!hit) return;
    const kind = hit.getAttribute('role') || 'dialog';
    // A dialog's full text is a wall of field labels; its heading identifies it.
    const heading = kind === 'dialog' ? hit.querySelector('h1,h2,h3,[role=heading]') : null;
    const text = clip(heading ? heading.textContent : hit.textContent, 200);
    if (!text) return;
    send({ type: 'ui', kind, text, testid: hit.getAttribute('data-testid') || undefined });
  };
  const start = () =>
    new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach(announce))).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  if (document.documentElement) start();
  else document.addEventListener('DOMContentLoaded', start);

  window.addEventListener('error', (e) => send({ type: 'pageerror', text: clip(e.message, 200) }));
}

const round = (n) => Math.round(n * 10) / 10;

/**
 * Opens a recorded browser session. `drive(page)` is for tests: when given, it replaces the
 * wait for the human. Resolves with the output directory.
 */
export async function record(options, drive) {
  const { name, url, viewport, storageState, headless, outRoot = 'recordings', intake, cursor = true } = options;
  const dir = path.join(outRoot, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const events = [];
  const network = [];
  let t0 = Date.now();
  const now = () => round((Date.now() - t0) / 1000);
  const origin = new URL(url).origin;

  if (intake) fs.writeFileSync(path.join(dir, 'intake.md'), intake);

  const browser = await chromium.launch({ headless: Boolean(headless) });
  const context = await browser.newContext({
    viewport,
    storageState,
    recordVideo: { dir: path.join(dir, '.video'), size: viewport },
  });
  await context.exposeBinding('__recEvent', (source, payload) => {
    const event = { t: now(), ...payload, url: new URL(source.frame.url()).pathname };
    // The same message can be announced twice by re-renders; keep the first within 1s.
    if (event.type === 'ui') {
      const dup = events.some((e) => e.type === 'ui' && e.text === event.text && event.t - e.t < 1);
      if (dup) return;
    }
    events.push(event);
  });
  await context.addInitScript(pageScript, { cursor });

  // Field NAMES only, never values (they can hold personal data).
  const bodyKeys = (req) => {
    const type = req.headers()['content-type'] || '';
    try {
      if (type.includes('multipart/form-data')) {
        const names = [...(req.postData() || '').matchAll(/Content-Disposition: form-data; name="([^"]+)"/g)].map((m) => m[1]);
        return names.length ? [...new Set(names)] : undefined;
      }
      const body = req.postDataJSON();
      return body && typeof body === 'object' && !Array.isArray(body) ? Object.keys(body) : undefined;
    } catch {
      return undefined;
    }
  };
  context.on('response', (res) => {
    const req = res.request();
    if (!['fetch', 'xhr', 'document'].includes(req.resourceType())) return;
    const u = new URL(res.url());
    // Dev-server internals (hot reload, error overlay) are noise, not app behavior.
    if (u.pathname.startsWith('/_next/') || u.pathname.startsWith('/__nextjs')) return;
    network.push({
      t: now(),
      method: req.method(),
      host: u.origin === origin ? undefined : u.host,
      path: u.pathname,
      queryKeys: [...u.searchParams.keys()],
      status: res.status(),
      bodyKeys: bodyKeys(req),
    });
  });

  t0 = Date.now();
  const page = await context.newPage();
  page.on('framenavigated', (frame) => {
    if (frame !== page.mainFrame()) return;
    const pathname = new URL(frame.url()).pathname;
    const last = [...events].reverse().find((e) => e.type === 'navigate');
    // Dev-mode reloads re-fire the same navigation moments after load; keep the first.
    if (last && last.url === pathname && now() - last.t < 2) return;
    events.push({ t: now(), type: 'navigate', url: pathname });
  });
  await page.goto(url);

  let finish;
  const done = new Promise((resolve) => (finish = resolve));
  browser.on('disconnected', finish);
  let rl;
  if (drive) {
    await drive(page);
    finish();
  } else {
    console.log('\nRecording. Do your flow in the browser window, then close the window (or press Enter here).');
    rl = readline.createInterface({ input: process.stdin });
    rl.once('line', finish);
  }
  await done;
  rl?.close();

  const durationSec = now();
  const video = page.video();
  try {
    await context.close();
  } catch {
    /* browser window already closed */
  }
  await browser.close().catch(() => {});

  let videoFile = null;
  try {
    const src = video ? await video.path() : null;
    if (src && fs.existsSync(src)) {
      videoFile = 'recording.webm';
      fs.renameSync(src, path.join(dir, videoFile));
    }
  } catch {
    /* no video produced */
  }
  fs.rmSync(path.join(dir, '.video'), { recursive: true, force: true });

  fs.writeFileSync(path.join(dir, 'events.jsonl'), events.map((e) => JSON.stringify(e)).join('\n') + (events.length ? '\n' : ''));
  fs.writeFileSync(path.join(dir, 'network.json'), JSON.stringify(network, null, 2) + '\n');
  let gitSha = null;
  try {
    gitSha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    /* not a git checkout */
  }
  fs.writeFileSync(
    path.join(dir, 'meta.json'),
    JSON.stringify(
      { name, url, viewport, durationSec, video: videoFile, events: events.length, networkCalls: network.length, gitSha },
      null,
      2,
    ) + '\n',
  );
  return { dir, events: events.length, networkCalls: network.length, video: videoFile, durationSec };
}

const QUESTIONS = [
  ['Goal', 'What behavior are you testing? '],
  ['Expected outcome', 'What should be true at the end (what the app should show or do)? '],
  ['Data', 'What data does this rely on (e.g. seed restaurants, none)? '],
  ['Logged in as', 'Logged in as (visitor/admin)? [visitor] '],
  ['Ignore in the recording', 'Anything in the recording to ignore (mistakes, retries)? '],
];

async function askIntake() {
  console.log('Intake: a few questions so the test case matches your intent. Press Enter to skip any.\n');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const lines = ['# Intake', ''];
  for (const [label, q] of QUESTIONS) {
    let a = (await rl.question(q)).trim();
    if (!a && label === 'Logged in as') a = 'visitor';
    lines.push(`- **${label}:** ${a || 'not provided'}`);
  }
  rl.close();
  return lines.join('\n') + '\n';
}

function parseArgs(argv) {
  const opts = { name: null, url: 'http://localhost:3000', viewport: { width: 1280, height: 720 }, prompt: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') opts.url = argv[++i];
    else if (a === '--viewport') {
      const [w, h] = String(argv[++i]).split('x').map(Number);
      if (!w || !h) throw new Error('--viewport must look like 1280x720');
      opts.viewport = { width: w, height: h };
    } else if (a === '--storage-state') opts.storageState = argv[++i];
    else if (a === '--no-prompt') opts.prompt = false;
    else if (a === '--no-cursor') opts.cursor = false;
    else if (a === '--headless') opts.headless = true;
    else if (a.startsWith('--')) throw new Error(`Unknown option ${a}`);
    else if (!opts.name) opts.name = a;
  }
  if (!opts.name) {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    opts.name = `flow-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }
  if (!/^[\w.-]+$/.test(opts.name)) throw new Error('name may only contain letters, digits, dot, dash and underscore');
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  try {
    await fetch(opts.url, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error(
      `Cannot reach ${opts.url}. Start the app first, against the test database:\n  npx dotenv -e .env.test -e .env -- npm run dev`,
    );
    process.exit(1);
  }
  const intake = opts.prompt ? await askIntake() : undefined;
  const result = await record({ ...opts, intake });
  console.log(`\nSaved to ${result.dir}: ${result.events} actions, ${result.networkCalls} network calls, ${result.durationSec}s.`);
  console.log(`Next: /record-to-test ${result.dir}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
