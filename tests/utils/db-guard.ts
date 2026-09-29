/**
 * Safety guard for agent-driven test runs.
 *
 * Tests create and delete real rows through the API, so a run must never point at an
 * unintended database. When TEST_ENV=1 (npm run test:agent), the database name parsed from
 * DATABASE_URL has to equal ALLOWED_TEST_DB (set in the gitignored .env.test).
 */
export function getDatabaseName(databaseUrl: string): string {
  try {
    return new URL(databaseUrl).pathname.replace(/^\//, '');
  } catch {
    return '';
  }
}

export function assertAllowedTestDatabase(env: NodeJS.ProcessEnv = process.env): void {
  const { DATABASE_URL, ALLOWED_TEST_DB } = env;

  if (!ALLOWED_TEST_DB) {
    throw new Error('DB guard: ALLOWED_TEST_DB is not set. Add it to .env.test.');
  }
  if (!DATABASE_URL) {
    throw new Error('DB guard: DATABASE_URL is not set. Add it to .env.test.');
  }

  const dbName = getDatabaseName(DATABASE_URL);
  if (dbName !== ALLOWED_TEST_DB) {
    // Never print the URL: it contains credentials.
    throw new Error(
      `DB guard: database "${dbName || 'unknown'}" does not match ALLOWED_TEST_DB "${ALLOWED_TEST_DB}". Refusing to run tests.`
    );
  }
}
