# Halal Bites ATL

Next.js + Prisma (Postgres) app. Playwright tests live in `tests/`.

## Testing conventions (used by the test-orchestrator agents in `.claude/agents/`)
- Specs: `tests/<feature>.spec.ts`, kebab-case, `test.describe`, imports `test`/`expect` from `@playwright/test`.
- Page objects: `tests/pages/<name>.page.ts`, one class per page or component, locators as
  readonly properties, actions as methods, no assertions on unrelated pages. Created only when
  no existing one fits.
- Helpers: `tests/utils/test-helpers.ts` (flat exported functions with JSDoc), test data in
  `tests/utils/test-data.ts`. Search these before writing anything new.
- Selectors: `data-testid` first. Some testids appear twice (desktop and mobile layouts), so
  scope to the visible one. If a testid is missing, add it to the component in `src/` rather than
  using brittle CSS or text selectors.
- Use `baseURL` (`page.goto('/')`), never a hardcoded URL. No `page.waitForTimeout`; use web-first
  assertions (`expect(locator).toBeVisible()`, `toHaveCount`) or `waitForResponse`.
- Test data is created through the API with unique names and deleted in `afterEach`.
- Admin routes need an `admin_session` cookie (see `src/middleware.ts`); only build an admin login
  helper when a test case needs it.
- Agent runs use `npm run test:agent`, which loads `.env.test` and refuses to run unless the
  database name equals `ALLOWED_TEST_DB` (`tests/utils/db-guard.ts`). Never print or commit
  connection strings or any `.env*` file.
