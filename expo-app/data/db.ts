import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("workout.db");

/**
 * Run migrations based on PRAGMA user_version.
 * Call once at app startup
 */
export function migrateDbIfNeeded() {
  // Always enforce
  db.execSync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);

  // Get current schema version
  const { user_version } =
    // @ts-ignore
    db.getFirstSync<{ user_version: number }>("PRAGMA user_version") ?? {
      user_version: 0,
    };

  if (user_version < 1) {
    db.execSync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);

    const { user_version } =
      // @ts-ignore
      db.getFirstSync<{ user_version: number }>("PRAGMA user_version") ?? {
        user_version: 0,
      };

    if (user_version < 1) {
      db.execSync(`
      -- v1: clean normalized schema

      CREATE TABLE IF NOT EXISTS exercise (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        muscle_group TEXT,
        equipment TEXT,
        is_bodyweight INTEGER NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg','lb')),
        notes TEXT,
        is_system INTEGER NOT NULL DEFAULT 0, -- 1 = seeded/bundled, 0 = user-created
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS workout (
        id TEXT PRIMARY KEY,
        performed_at TEXT NOT NULL,              -- ISO date-time
        duration_sec INTEGER,
        notes TEXT,
        total_sets INTEGER NOT NULL DEFAULT 0,
        total_exercises INTEGER NOT NULL DEFAULT 0,
        total_volume_g INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS workout_exercise (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        notes TEXT,
        rest_time INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY(workout_id) REFERENCES workout(id) ON DELETE CASCADE,
        FOREIGN KEY(exercise_id) REFERENCES exercise(id)
      );

      CREATE TABLE IF NOT EXISTS workout_set (
        id TEXT PRIMARY KEY,
        workout_exercise_id TEXT NOT NULL,
        set_index INTEGER NOT NULL,              -- 1..N within that exercise in this workout
        set_type TEXT,                           -- normal | warmup | dropset | failure
        reps_x10 INTEGER,                        -- 85 => 8.5 reps
        weight_g INTEGER,                        -- stored in grams (0 for bodyweight)
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercise(id) ON DELETE CASCADE
      );

      -- indexes
      CREATE INDEX IF NOT EXISTS idx_exercise_active_name
        ON exercise (is_system DESC, name COLLATE NOCASE)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_exercise_deleted_at
        ON exercise (deleted_at);

      CREATE INDEX IF NOT EXISTS idx_workout_exercise_workout_id
        ON workout_exercise (workout_id);

      CREATE INDEX IF NOT EXISTS idx_ws_we_time
        ON workout_set (workout_exercise_id, created_at);

      PRAGMA user_version = 1;
    `);
    }

    db.execSync(`PRAGMA user_version = 1`);
  }

  // Future upgrades:
  // if (user_version < 2) {
  //   db.execSync("ALTER TABLE exercise ADD COLUMN difficulty TEXT;");
  //   db.execSync("PRAGMA user_version = 2");
  // }
}

/** Convenience wrappers (promise signatures for React Query) */
export async function dbAll<T = any>(
  sql: string,
  ...args: any[]
): Promise<T[]> {
  // @ts-ignore
  return db.getAllSync<T>(sql, ...args);
}

export async function dbFirst<T = any>(
  sql: string,
  ...args: any[]
): Promise<T | undefined> {
  // @ts-ignore
  return db.getFirstSync<T>(sql, ...args);
}

export async function dbRun(sql: string, ...args: any[]): Promise<void> {
  // @ts-ignore
  db.runSync(sql, ...args);
}

/** Unit helpers */
export const KG_PER_LB = 0.45359237;

export function toGrams(unit: "kg" | "lb", weight: number): number {
  const kg = unit === "kg" ? weight : weight * KG_PER_LB;
  return Math.round(kg * 1000);
}

export function gramsToUnit(unit: "kg" | "lb", grams: number): number {
  const kg = grams / 1000;
  return unit === "kg" ? kg : kg / KG_PER_LB;
}
