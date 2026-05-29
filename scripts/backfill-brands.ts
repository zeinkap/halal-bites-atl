/**
 * Backfill Brand rows and Restaurant.brandId using the "Brand - Location"
 * naming convention.
 *
 * A "brand" is the part of the name before the first " - " (or the whole name
 * if there is no " - "). Any brand key shared by 2+ restaurants is treated as a
 * multi-location chain: a Brand row is ensured and every location is linked.
 *
 * Safe by default:
 *   npx ts-node scripts/backfill-brands.ts            # dry-run on .env (dev)
 *   npx ts-node scripts/backfill-brands.ts --apply    # write to dev
 *   npx ts-node scripts/backfill-brands.ts --prod             # dry-run on prod
 *   npx ts-node scripts/backfill-brands.ts --prod --apply     # write to prod
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

const APPLY = process.argv.includes('--apply');
const USE_PROD = process.argv.includes('--prod');

const envFile = USE_PROD ? '.env.production' : '.env';
// override so the chosen env file wins even if DATABASE_URL is already set in
// the shell environment (otherwise dotenv silently keeps the existing value).
dotenv.config({ path: envFile, override: true });

if (!process.env.DATABASE_URL) {
  console.error(chalk.red(`Error: DATABASE_URL is not set in ${envFile}`));
  process.exit(1);
}

console.log(chalk.blue('Target DB:'), process.env.DATABASE_URL.replace(/:\/\/.*@/, '://*****@'));
console.log(chalk.blue('Mode:'), APPLY ? chalk.red.bold('APPLY (will write)') : chalk.green('dry-run'));

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

function brandKey(name: string): string {
  const idx = name.indexOf(' - ');
  return (idx === -1 ? name : name.slice(0, idx)).trim();
}

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true, brandId: true },
    orderBy: { name: 'asc' },
  });

  // Group by brand key
  const groups = new Map<string, typeof restaurants>();
  for (const r of restaurants) {
    const key = brandKey(r.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const multi = [...groups.entries()].filter(([, list]) => list.length >= 2);
  console.log(chalk.bold(`\nFound ${multi.length} multi-location brands (${restaurants.length} restaurants total):\n`));

  let brandsCreated = 0;
  let linksSet = 0;

  for (const [key, list] of multi) {
    let brand = await prisma.brand.findUnique({ where: { name: key } });
    const willCreate = !brand;
    if (willCreate) {
      brandsCreated++;
      if (APPLY) {
        brand = await prisma.brand.create({ data: { name: key } });
      }
    }

    console.log(
      `${chalk.cyan(key)} ${chalk.gray(`(${list.length} locations)`)}` +
      (willCreate ? chalk.yellow('  [create brand]') : chalk.gray('  [brand exists]'))
    );

    for (const r of list) {
      const brandId = brand?.id;
      const needsLink = brandId ? r.brandId !== brandId : true;
      if (needsLink) {
        linksSet++;
        console.log(`   ${chalk.gray('→ link')} ${r.name}`);
        if (APPLY && brandId) {
          await prisma.restaurant.update({ where: { id: r.id }, data: { brandId } });
        }
      } else {
        console.log(`   ${chalk.green('✓ already linked')} ${r.name}`);
      }
    }
  }

  console.log(chalk.bold(`\nSummary: ${brandsCreated} brands to create, ${linksSet} restaurants to link.`));
  if (!APPLY) console.log(chalk.green('Dry-run only — no changes written. Re-run with --apply to commit.'));
}

main()
  .catch((e) => {
    console.error(chalk.red(e));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
