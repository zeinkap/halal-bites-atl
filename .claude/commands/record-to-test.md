---
description: Turn a screen recording into a draft manual test case, confirm it with you, then run the convert-test pipeline
argument-hint: <path to recording (.mp4/.mov/.webm)> [what you were testing / what should happen]
---

Run the recording-to-test pipeline on: $ARGUMENTS

The first word is the video path; anything after it is the recorder's notes. Subagents don't share
context, so pass the path and the notes to each agent. Use the Agent tool with the named subagent
types, and never do an agent's job yourself.

## Pipeline
1. **Check inputs.** The file must exist and be `.mp4`, `.mov`, `.webm` or `.mkv`. Run
   `command -v ffmpeg ffprobe`; if either is missing, stop and tell the user to install ffmpeg
   (macOS: `brew install ffmpeg`). Recordings stay in `recordings/` (gitignored): remind the user
   not to move one into a tracked folder, and never `git add` a video or frames.
2. **Agent 0: `recording-to-test-case`.** Pass the video path and notes. It writes
   `test-cases/<slug>.md` and returns NEEDS_CONFIRMATION items.
3. **Human checkpoint (always).** Show the user the draft path, a short summary of the steps and
   the expected result, and every NEEDS_CONFIRMATION item. Then STOP and wait. Expected results are
   inferred from a video, so never skip this, even if the list is empty. Apply the user's answers
   to the file (or let them edit it) and delete the `## Draft notes` section once resolved.
4. **Convert.** Once the user confirms, follow `.claude/commands/convert-test.md` exactly for the
   confirmed file: Agent 1 `test-case-reviewer`, Agent 2 `playwright-converter`, Agent 3
   `playwright-reviewer` (max 3 fix rounds), Agent 4 `pr-creator`.

## Rules
- One line per stage as it completes, as in `/convert-test`.
- If the recording agent reports that frames were too sparse or unreadable, say so and ask for a
  shorter or higher-quality recording instead of guessing.
- Finish with: the draft path, what the user confirmed, and then the `/convert-test` summary.
