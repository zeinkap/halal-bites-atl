import { existsSync } from 'fs';

/**
 * Safety guard for agent-driven test runs.
 *
 * Tests create and delete real rows through the API, so a run must never point at an
 * unintended database. playwright.config.ts calls this on every run: the database name parsed
 * from DATABASE_URL has to equal ALLOWED_TEST_DB (set in the gitignored .env.test).
 */
export function getDatabaseName(databaseUrl: string): string {
  try {
    return new URL(databaseUrl).pathname.replace(/^\//, '');
  } catch {
    return '';
  }
}

/** Tells the user how to fix a missing variable, depending on whether .env.test exists yet. */
function missingVarError(name: string, envFileExists: boolean): Error {
  if (envFileExists) {
    return new Error(`DB guard: ${name} is not set in .env.test.`);
  }
  return new Error(
    `DB guard: .env.test not found and ${name} is not set. Copy .env.test.example to .env.test ` +
      'and fill in the test database values (see README, "Running tests locally"). ' +
      'In CI, set DATABASE_URL and ALLOWED_TEST_DB in the workflow env.'
  );
}

export function assertAllowedTestDatabase(
  env: NodeJS.ProcessEnv = process.env,
  envFileExists: boolean = existsSync('.env.test')
): void {
  const { DATABASE_URL, ALLOWED_TEST_DB } = env;

  if (!ALLOWED_TEST_DB) {
    throw missingVarError('ALLOWED_TEST_DB', envFileExists);
  }
  if (!DATABASE_URL) {
    throw missingVarError('DATABASE_URL', envFileExists);
  }

  const dbName = getDatabaseName(DATABASE_URL);
  if (dbName !== ALLOWED_TEST_DB) {
    // Never print the URL: it contains credentials.
    throw new Error(
      `DB guard: database "${dbName || 'unknown'}" does not match ALLOWED_TEST_DB "${ALLOWED_TEST_DB}". Refusing to run tests.`
    );
  }
}
