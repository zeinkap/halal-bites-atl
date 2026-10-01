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

## From a screen recording
Record yourself using the app (a short, single-purpose recording works best: one flow, a pause
at the end so the final state is visible), then in Claude Code run:

```
/record-to-test recordings/my-flow.mov Searching for a non-existent restaurant should show the empty state
```

An agent samples frames from the video (needs `ffmpeg`: `brew install ffmpeg`), drafts a test case
in `test-cases/`, and stops for you to confirm. A recording shows what you did, not what should
happen, so the expected result is a guess until you confirm it. Keep recordings in `recordings/`
(gitignored); they can contain personal data. After you confirm, the normal pipeline below runs.

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
