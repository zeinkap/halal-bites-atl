# Halal Bites ATL

Next.js + Prisma (Postgres) app. Playwright tests live in `tests/`.

## Testing conventions (used by the test-orchestrator agents in `.claude/agents/`)
- Specs: `tests/<feature>.spec.ts`, kebab-case, `test.describe`, imports `test`/`expect` from `@playwright/test`.
- Page objects: `tests/pages/<name>.page.ts`, one class per page or component, locators as
  readonly properties, actions as methods, no assertions on unrelated pages. Created only when
  no existing one fits.
- Helpers: shared code goes in `tests/utils/` (flat exported functions with JSDoc, e.g. a new
  `test-helpers.ts` for data setup or common actions; `db-guard.ts` is already there). Search
  `tests/utils/` and `tests/pages/` before writing anything new.
- Selectors: `data-testid` first. Some testids appear twice (desktop and mobile layouts), so
  scope to the visible one. If a testid is missing, add it to the component in `src/` rather than
  using brittle CSS or text selectors.
- Use `baseURL` (`page.goto('/')`), never a hardcoded URL. No `page.waitForTimeout`; use web-first
  assertions (`expect(locator).toBeVisible()`, `toHaveCount`) or `waitForResponse`.
- Every generated test is tagged `{ tag: '@orchestrated' }` (second argument of `test(...)`). CI
  runs `npm run test:agent -- --grep @orchestrated`, so an untagged test never runs in CI.
- Test data is created through the API with unique names and deleted in `afterEach`.
- Admin routes need an `admin_session` cookie (see `src/middleware.ts`); only build an admin login
  helper when a test case needs it.
- Playwright never reuses a running dev server, so run `scripts/free-port.sh` (default port 3000)
  first if one is left over; the reviewer agent does this automatically.
- Playwright (`npm run test:agent` or `npx playwright test`) always loads `.env.test` and refuses
  to run unless the database name equals `ALLOWED_TEST_DB` (`tests/utils/db-guard.ts`). Never
  print or commit connection strings or any `.env*` file.
