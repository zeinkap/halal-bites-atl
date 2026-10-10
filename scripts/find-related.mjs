#!/usr/bin/env node
// Answers two questions about a recording, with evidence instead of a guess:
//   1. Is this flow already covered? Ranks existing specs and test cases by what they share with
//      the recording (testids, typed values, names of the things clicked).
//   2. Does the data on screen exist in the seed data? Checks restaurant names you pass in.
//
// Usage: node scripts/find-related.mjs <recordings/name> [--names "Jerusalem Bakery & Grill" "Bismillah Cafe"]
// Reads events.jsonl, tests/**/*.ts, test-cases/*.md and prisma/seed.ts. Never writes anything.
//
// The seed check says what the SEED contains, not what the test database contains: the database
// can differ (the real answer is the same names in the test DB).
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
const namesIdx = args.indexOf('--names');
const names = namesIdx >= 0 ? args.slice(namesIdx + 1).filter((a) => !a.startsWith('--')) : [];
if (!dir || !fs.existsSync(path.join(dir, 'events.jsonl'))) {
  console.error('Usage: node scripts/find-related.mjs <recordings/name> [--names "A" "B"]');
  process.exit(2);
}

const events = fs
  .readFileSync(path.join(dir, 'events.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));

const testids = new Set();
const typed = new Set();
const labels = new Set();
for (const e of events) {
  if (e.target?.testid) testids.add(e.target.testid);
  if (e.type === 'input' && typeof e.value === 'string' && e.value.length >= 3 && e.value !== '<redacted>') typed.add(e.value);
  if (e.type === 'click' && e.target?.name && e.target.name.length >= 3) labels.add(e.target.name);
}

const walk = (d, filter) => {
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((f) => {
    const p = path.join(d, f.name);
    return f.isDirectory() ? walk(p, filter) : filter(p) ? [p] : [];
  });
};
const files = [...walk('tests', (p) => p.endsWith('.ts')), ...walk('test-cases', (p) => p.endsWith('.md') && !/README|_template/.test(p))];

const results = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  const shared = {
    testids: [...testids].filter((t) => text.includes(t)),
    typed: [...typed].filter((v) => lower.includes(v.toLowerCase())),
    clicked: [...labels].filter((l) => lower.includes(l.toLowerCase())),
  };
  const score = shared.testids.length + shared.typed.length + shared.clicked.length;
  if (score > 0) results.push({ file, score, shared });
}
results.sort((a, b) => b.score - a.score);

const total = testids.size + typed.size + labels.size;
console.log(`Recording has ${testids.size} testids, ${typed.size} typed values, ${labels.size} clicked labels (${total} signals).`);
console.log('\nRelated existing tests and cases (most overlap first):');
if (!results.length) console.log('  none: no existing spec or case shares a testid, typed value or clicked label.');
for (const r of results.slice(0, 8)) {
  const parts = [];
  if (r.shared.testids.length) parts.push(`testids: ${r.shared.testids.join(', ')}`);
  if (r.shared.typed.length) parts.push(`typed: ${r.shared.typed.map((v) => `"${v}"`).join(', ')}`);
  if (r.shared.clicked.length) parts.push(`clicked: ${r.shared.clicked.map((v) => `"${v}"`).join(', ')}`);
  console.log(`  ${r.file}  shares ${r.score}/${total}  (${parts.join('; ')})`);
}

if (names.length) {
  console.log('\nSeed data check (prisma/seed.ts):');
  const seed = fs.existsSync('prisma/seed.ts') ? fs.readFileSync('prisma/seed.ts', 'utf8').split('\n') : [];
  for (const n of names) {
    const lineNo = seed.findIndex((l) => l.toLowerCase().includes(n.toLowerCase()));
    console.log(lineNo >= 0 ? `  "${n}": found in the seed (prisma/seed.ts:${lineNo + 1})` : `  "${n}": NOT in the seed`);
  }
  console.log('  Note: this is the seed, not the test database. Confirm the same rows exist there.');
}
