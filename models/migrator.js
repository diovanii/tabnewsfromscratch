import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database.js";

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let databaseClient;

  try {
    databaseClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
    });

    return pendingMigrations;
  } finally {
    await databaseClient?.end();
  }
}

async function runPendingMigrations() {
  let databaseClient;

  try {
    databaseClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
      dryRun: false,
    });

    return migratedMigrations;
  } finally {
    await databaseClient?.end();
  }
}

const migrator = {
  listPendingMigrations: listPendingMigrations,
  runPendingMigrations: runPendingMigrations,
};

export default migrator;
