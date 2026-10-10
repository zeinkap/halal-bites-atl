---
description: Turn a recording into a draft manual test case, with two human checkpoints, then run the convert-test pipeline
argument-hint: <recordings/<name> folder from `npm run record`, or a video file> [what you were testing / what should happen]
---

Run the recording-to-test pipeline on: $ARGUMENTS

The first word is the input; anything after it is extra notes from the recorder. Subagents don't
share context, so pass the folder path and the notes to each agent. Use the Agent tool with the
named subagent types, and never do an agent's job yourself.

## Input
- **Best:** a folder made by `npm run record -- <name>` (`recordings/<name>/`), holding
  `recording.webm`, `events.jsonl` (what was clicked and typed), `network.json`, `intake.md` and
  `meta.json`. This is what makes the draft accurate.
- **Fallback:** a bare video (`.mp4`, `.mov`, `.webm`, `.mkv`). There are no recorded actions, so
  the agent reads everything from frames. Tell the user this is less accurate and that
  `npm run record` is better. Create `recordings/<video name>/` and use it as the working folder.

## Pipeline
1. **Check inputs.** The folder or file must exist. Run `command -v ffmpeg ffprobe`; if either is
   missing, stop and tell the user to install ffmpeg (macOS: `brew install ffmpeg`). Recordings
   stay in `recordings/` (gitignored): never `git add` a video, frames or any recording file.
2. **Intake (before anything is extracted).** Read `recordings/<name>/intake.md` and the user's
   notes. The test case's expected result comes from the user, never from guessing, so if
   **Expected outcome** is missing or `not provided`, ask the user now, in one message:
   - What behavior are you testing?
   - What should be true at the end (what the app should show or do)?
   - What data does it rely on (seed restaurants, none)?
   - Visitor or admin?
   - Anything in the recording to ignore (mistakes, retries)?
   Write the answers to `recordings/<name>/intake.md` in the same `- **Label:** value` format. If
   the user says they don't know the expected outcome, write `not provided`; the draft will then
   carry a note that it is inferred and unconfirmed.
3. **Phase A: Agent `recording-to-test-case`, phase `observe`.** It writes
   `recordings/<name>/observed.md`: a neutral timeline of what happened, with no expectations.
4. **Checkpoint 1: confirm what happened.** Show the user the timeline table (condensed if long),
   the start and end state, and every question. Ask them to correct anything wrong or missing.
   Apply the corrections to `observed.md` (or let them edit the file). STOP and wait; do not
   continue until they confirm. This is the cheap place to catch a misread click or typed value.
5. **Phase B: Agent `recording-to-test-case`, phase `draft`.** It writes `test-cases/<slug>.md`
   from the confirmed `observed.md` and `intake.md`, and returns NEEDS_CONFIRMATION items,
   IMPLEMENTATION_HINTS and SUGGESTED_SPLITS.
6. **Checkpoint 2: confirm the test case.** Show the user the draft path, the steps, the expected
   result and its source (`intake` or `inferred`), the confidence summary (list every `low` row of
   the Provenance table), the DUPLICATE_CHECK and DATA_CHECK results, and every question **with
   its proposed default**. Tell them they can reply `accept defaults` to apply all the proposed
   defaults, or answer individually. STOP and wait, even if there are no questions. Apply the
   answers (or the defaults), then delete the whole `## Draft notes` section.
7. **Convert.** Once the user confirms, follow `.claude/commands/convert-test.md` exactly for the
   confirmed file: Agent 1 `test-case-reviewer`, Agent 2 `playwright-converter`, Agent 3
   `playwright-reviewer` (max 3 fix rounds), Agent 4 `pr-creator`. Pass the converter the
   IMPLEMENTATION_HINTS from step 5 along with the case.

## Rules
- One line per stage as it completes, as in `/convert-test`.
- Two checkpoints are mandatory. Never skip either, and never carry on past a question the user
  has not answered.
- If the recording agent reports that frames were too sparse or unreadable, or that events and
  video disagree in a way it cannot resolve, say so and ask for a re-recording instead of guessing.
- Finish with: the draft path, what the user confirmed at each checkpoint, then the
  `/convert-test` summary.
