import { Client } from "pg";
import { readFileSync, readdirSync, writeFileSync, } from "fs";
import { resolve, dirname, join, } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { getDbClient } from "../lib/db.js";
import { logger } from "../../src/config/logger.js";


type MigrationFile = {
  version: string;
  name: string;
  filename: string;
  filepath: string;
  rollbackPath: string;
};

type MigrationContent = {
  sql: string;
  checksum: string;
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const DB_DIR = resolve(__dirname, '../../db/');
const MIGRATIONS_DIR = resolve(DB_DIR, 'migrations/versions/');
const ROLLBACKS_DIR = resolve(DB_DIR, 'migrations/rollbacks/');
const SCHEMA_MIGRATIONS_SQL = resolve(DB_DIR, 'schema_migrations.sql');


/**
 * Initializes the database by reading and executing `../db/schema_migrations.sql`,
 * which is idempotent because of `create if not exists`. This is to say that it is
 * safe to run this function every time.
 * 
 * @param {Client} client - The database client instance to execute migrations against.
 * @returns {Promise<void>}
 */
const bootstrap = async (client: Client): Promise<void> => {
  const sql = readFileSync(SCHEMA_MIGRATIONS_SQL, 'utf-8');
  await client.query(sql);
}


/**
 * Discovers and validates migration files from the migrations directory.
 * Scans for SQL files matching the `YYYYMMDDHHmmss_name.sql` format and ensures
 * a corresponding rollback file exists for each migration.
 *
 * @returns {MigrationFile[]} An array of migration file objects with version, name, and paths.
 * @throws {Error} If a migration filename is invalid or its rollback file is missing.
 */
const discoverMigrations = (): MigrationFile[] => {
  const versionFiles = readdirSync(MIGRATIONS_DIR)
    .filter((item: string) => item.endsWith('.sql'));
    
  const rollbackFiles = new Set(
    readdirSync(ROLLBACKS_DIR)
    .filter((item: string) => item.endsWith('.sql'))
  );

  return versionFiles
    .sort()
    .map((item: string) => {
      const version = item.slice(0, 14);
      const name = item.slice(15).replace('.sql', '');

      if (!/^\d{14}$/.test(version)) {
        throw new Error(`Invalid migration filename: ${item}. Expected format: YYYYMMDDHHmmss_name.sql`);
      }

      if (!rollbackFiles.has(item)) {
        throw new Error(`Missing rollback file for migration: ${item}. Expected: migrations/rollbacks/${item}`)
      }

      return {
        version,
        name,
        filename: item,
        filepath: resolve(MIGRATIONS_DIR, item),
        rollbackPath: resolve(ROLLBACKS_DIR, item),
      };
    });
}


/**
 * Retrieves the set of migration versions that have been applied to the database.
 * Queries the migrations tracking table for all non-rolled-back migrations, sorted by version.
 *
 * @param {Client} client - The database client instance.
 * @returns {Promise<Set<string>>} A set of applied migration version strings.
 */
const getAppliedMigrations = async (client: Client): Promise<Set<string>> => {
  const result = await client.query<{ version: string }> (
    `
      select version
      from migrations.schema_migrations
      where rolled_back_at is null
      order by version asc
    `
  )
  .then(({ rows }) => rows.map(item => item.version))

  return new Set(result);
}


/**
 * Filters discovered migrations to return only those not yet applied.
 *
 * @param {MigrationFile[]} discovered - Array of discovered migration files.
 * @param {Set<string>} applied - Set of applied migration version strings.
 * @returns {MigrationFile[]} Array of pending migrations.
 */
const getPendingMigrations = (
  discovered: MigrationFile[],
  applied: Set<string>,
): MigrationFile[] => {
  return discovered.filter(item => !applied.has(item.version));
}


/**
 * Loads a SQL file's content as a UTF-8 string and generates a hex-encoded hash for integrity verification.
 *
 * @param {string} filepath - The path to the SQL file.
 * @returns {MigrationContent} An object containing `sql` and `checksum` properties.
 */
const readSqlFile = (filepath: string): MigrationContent => {
  const sql = readFileSync(filepath, 'utf-8');
  const checksum = createHash('sha256')
    .update(sql)
    .digest('hex');

  return { sql, checksum, };
}


/**
 * Prints a formatted migration status report to the logger.
 * Displays all discovered migrations with their applied/pending status and names.
 * Logs a summary count if migrations are found; otherwise logs a "not found" message.
 *
 * @param {MigrationFile[]} discovered - Array of discovered migration files.
 * @param {Set<string>} applied - Set of applied migration version strings.
 * @returns {Promise<void>}
 */
const printStatus = async (
  discovered: MigrationFile[],
  applied: Set<string>
): Promise<void> => {
  if (discovered.length === 0) {
    logger.info('No migration files found.');
    return;
  }

  const rows = discovered.map(item => {
    const isApplied = applied.has(item.version);
    const status = isApplied ? 'applied' : 'pending';
    const indicator = isApplied ? '✓' : '○';
    return `  ${indicator} ${item.version}  ${status.padEnd(10)}${item.name}`;
  });

  const pending = discovered.filter(item => !applied.has(item.version));

  logger.info(
    [
      '',
      'Migration status:',
      '',
      '  Version'.padEnd(18) + 'Status'.padEnd(12) + 'Name',
      '  ' + '-'.repeat(60),
      ...rows,
      '',
      `  ${applied.size} applied, ${pending.length} pending.`,
      '',
    ].join('\n')
  );
}


/**
 * 
 */
const getTimestamp = (): string => {
  const now = new Date();
  return [
    now.getUTCFullYear(),
    String(now.getUTCMonth() +1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
  ].join('');
}


/**
 * Executes a migration by running the up SQL and inserting a record into schema_migrations.
 * Reads the migration SQL file, executes it within a transaction, and records the migration metadata.
 * Rolls back the transaction on error.
 *
 * @param {Client} client - PostgreSQL client connection.
 * @param {MigrationFile} migration - Migration file object with version, name, and filename.
 * @param {number} startedAt - Timestamp (milliseconds) when migration execution began.
 * @returns {Promise<void>}
 * @throws {Error} If SQL execution or database insert fails.
 */
const applyMigration = async (
  client: Client,
  migration: MigrationFile,
  startedAt: number,
): Promise<void> => {
  const { sql, checksum, } = readSqlFile(migration.filepath);

  await client.query('begin');

  try {
    await client.query(sql);
    await client.query({
      text: `
        insert
        into migrations.schema_migrations (version, name, checksum, execution_time_ms)
        values ($1, $2, $3, $4)
      `,
      values: [
        migration.version,
        migration.name,
        checksum,
        Date.now() - startedAt,
      ],
    });
    await client.query('commit');

  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}


/**
 * Executes a migration rollback by running the down SQL and marking the migration as rolled back.
 * Reads the rollback SQL file, executes it within a transaction, and updates the schema_migrations table.
 * Rolls back the transaction on error.
 *
 * @param {Client} client - PostgreSQL client connection.
 * @param {MigrationFile} migration - Migration file object with version and rollbackPath.
 * @returns {Promise<void>}
 * @throws {Error} If SQL execution or database update fails.
 */
const rollbackMigration = async (
  client: Client,
  migration: MigrationFile,
): Promise<void> => {
  const { sql } = readSqlFile(migration.rollbackPath);

  await client.query('begin');

  try {
    await client.query(sql);
    await client.query({
      text: `
        update migrations.schema_migrations
        set rolled_back_at = now()
        where version = $1
      `,
      values: [migration.version],
    });
    await client.query('commit');

  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}


/**
 * Main entry point for the migration CLI tool.
 * Parses command-line arguments to execute migration operations: "up" (apply pending), "down" (rollback last), or "status" (display migration state).
 * Initializes database connection, discovers and applies/rolls back migrations as needed, and logs results.
 * Exits with code 1 on error or unknown command.
 *
 * @returns {Promise<void>}
 * @throws {Error} Caught and logged as fatal; triggers process.exit(1).
 */
const main = async (): Promise<void> => {
  const command = process.argv[2] ?? 'up';
  const client = await getDbClient();

  try {
    await bootstrap(client);

    const discovered = discoverMigrations();
    const applied = await getAppliedMigrations(client);

    if (command === 'status') {
      await printStatus(discovered, applied);
      return;
    }

    if (command === 'create') {
      const name = process.argv[3];

      if (!name) {
        logger.error(`Usage: migrate -- create <migration_name>`);
        process.exit(1);
      }

      const prefix = getTimestamp();
      const filename = `${prefix}_${name}.sql`;
      writeFileSync(join(MIGRATIONS_DIR, filename), '-- migrate up\n');
      writeFileSync(join(ROLLBACKS_DIR, filename), '-- migrate down\n');

      logger.info(
        [
          'Created migrations:',
          `  versions/${filename}`,
          `  rollbacks/${filename}`
        ].join('\n')
      );
      return;
    }

    if (command === 'down') {
      const appliedMigrations = discovered.filter(item => applied.has(item.version));

      if (!appliedMigrations.length) {
        logger.info('Nothing to roll back.');
        return;
      }

      const last = appliedMigrations[appliedMigrations.length - 1];
      logger.info(`Rolling back: ${last.version}_${last.name}...`);
      await rollbackMigration(client, last);
      logger.info('✓ Rolled back successfully');
      return;
    }

    if (command === 'up') {
      const pending = getPendingMigrations(discovered, applied);

      if (!pending.length) {
        logger.info('Nothing to migrate.');
        return;
      }

      logger.info(`Applying ${pending.length} migration(s):`);

      for (const item of pending) {
        const startedAt = Date.now();
        logger.info(`  ○ ${item.version}_${item.name}...`);
        await applyMigration(client, item, startedAt);
        logger.info({ duration: Date.now() - startedAt }, `  ✓ Done.`);
      };

      logger.info('✓ All migrations applied.');
      return;
    }

    logger.error(`Unknown command: "${command}". Expected: up, down, status`);
    process.exit(1);

  } catch (error) {
    logger.fatal({ err: error, }, 'Migration failed.');
    process.exit(1);

  } finally {
    await client.end();
  }
}


main();