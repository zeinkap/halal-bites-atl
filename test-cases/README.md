# Manual test cases

Manual test cases live here, one Markdown file per case, following `_template.md`.
Convert one into a Playwright spec with the orchestrator:

```
/convert-test test-cases/search-by-name.md
```

A case can also be pasted into the command instead of passing a path.

## Required fields
The reviewer agent returns `NEEDS_INFO` unless the case has: a title, steps (one action per
step), an expected result, preconditions, test data, and a stated admin requirement.

## From a recording
Record yourself using the app with the recorder. It captures the video **and** what a video
can't show: the exact elements you clicked, the values you typed, toasts and dialogs that appeared,
and which API calls fired. That is what makes the draft accurate.

1. Start the app against the test database, so the data matches what tests will see:
   `npx dotenv -e .env.test -e .env -- npm run dev`
2. In another terminal: `npm run record -- my-flow`. Answer the few intake questions (what you are
   testing, **what should be true at the end**, data needed, visitor or admin).
3. A browser window opens. Do the flow, pause a second at the end so the final state is visible,
   then close the window (or press Enter in the terminal). Output goes to `recordings/my-flow/`.
4. In Claude Code run `/record-to-test recordings/my-flow`.

The command works in two phases with a checkpoint after each:
- **Observe:** an agent reads your actions, the video and the network log and writes
  `recordings/my-flow/observed.md`, a neutral timeline of what happened with no expectations.
  It looks at frames taken right after every action (when a toast or dialog is on screen), checks
  whether existing specs already cover the flow, and checks that any restaurants shown exist in
  the seed data. You correct anything it got wrong.
- **Draft:** it then writes the test case from the confirmed timeline and your intake answers.
  The expected result comes from what you said, not from guessing. The draft ends with a
  provenance table (each step and expected result, where it came from, and how confident it is)
  and questions that each carry a proposed default, so you can reply `accept defaults`. You
  confirm the draft, and the normal pipeline below runs.

Notes:
- The recording shows a blue dot for the pointer and a red ring where you click, so frames can
  show what was clicked. `--no-cursor` turns that off.
- Options: `--url` (default `http://localhost:3000`), `--viewport 1280x720`, `--no-prompt`.
  Record at desktop width: the tests run in desktop Chrome, and the desktop and mobile layouts
  have different testids.
- Password fields are never captured, and network bodies are not saved (only field names), but
  anything else you type is in the video and `events.jsonl`. Use test data. For admin flows, save
  a login once and pass `--storage-state <file>` instead of typing a password on camera.
- Recordings are gitignored (`recordings/`); they can contain personal data.
- A bare video file still works (`/record-to-test path/to/video.mov`, needs `ffmpeg`:
  `brew install ffmpeg`), but without the recorded actions it is less accurate. For a video
  with no event log, `DENSE=1 scripts/extract-frames.sh <video>` samples more finely.

## Pipeline
1. `test-case-reviewer` checks the case is complete enough to automate (`READY` / `NEEDS_INFO`).
2. `playwright-converter` writes the spec, reusing page objects and helpers where they exist.
3. `playwright-reviewer` reviews statically first, then executes the spec (`PASS` / `FAIL`).
   A `FAIL` goes back to the converter, at most 3 rounds, then it escalates to you.
4. `pr-creator` opens a draft PR for your review.

## Running the generated tests
`npm run test:agent` runs Playwright against the database in `.env.test`. Create that file
(it is gitignored) from the template and fill in the values:

```
cp .env.test.example .env.test
```

`ALLOWED_TEST_DB` is the database name; runs are refused if it does not match the name in
`DATABASE_URL`.
