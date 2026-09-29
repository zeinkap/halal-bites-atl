---
description: Convert a manual test case (file path or pasted text) into a reviewed Playwright test and a draft PR
argument-hint: <path to test case .md, or paste the case>
---

Run the test orchestrator on: $ARGUMENTS

If the argument is a file path, read it. If it is pasted text, use it as the test case (save it to
`test-cases/` from the template only if the user asks). Keep the case text so you can pass it to
every agent, since subagents don't share context. Use the Agent tool with the named subagent
types below, and never do an agent's job yourself.

## Pipeline
1. **Guard check.** Confirm `.env.test` exists (do not print it). If not, stop and tell the user
   to create it (see `test-cases/README.md`).
2. **Agent 1: `test-case-reviewer`.** Pass the full case.
   - `NEEDS_INFO`: stop, show the questions to the user, and wait. Do not continue.
   - `READY`: continue, and carry its APP_FINDINGS and ASSUMPTIONS forward.
3. **Agent 2: `playwright-converter`.** Pass the case, APP_FINDINGS and ASSUMPTIONS.
4. **Agent 3: `playwright-reviewer`.** Pass the case, the converter report and changed files.
   - `PASS`: go to step 5.
   - `FAIL`: send the numbered ISSUES back to `playwright-converter` (with the case and its
     previous report), then re-run `playwright-reviewer`. **Maximum 3 fix rounds.**
   - Still `FAIL` after round 3, or reviewer says `BLOCKED`: stop and escalate. Show the last
     reviewer report, the files changed so far, and what you think the blocker is. Do not open a PR.
5. **Agent 4: `pr-creator`.** Pass the case, converter report, reviewer report and file list.

## Rules
- Run agents strictly in sequence; each depends on the previous output.
- Track the round number and tell the user one line per stage as it completes
  (e.g. `Agent 3 round 2: FAIL (2 issues)`).
- The draft PR is the end. Never merge or mark it ready.
- Finish with: verdict per stage, rounds used, files created/modified, the PR link.
