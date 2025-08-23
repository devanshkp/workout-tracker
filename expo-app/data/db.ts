import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("workout.db");

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    -- ======================
    -- Core tables
    -- ======================

    CREATE TABLE IF NOT EXISTS exercise (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      muscle_group TEXT,
      equipment TEXT,
      is_bodyweight INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'kg',                -- 'kg' | 'lb'
      notes TEXT,                            -- persistent personal notes / instructions
      is_system INTEGER DEFAULT 0,           -- 1 = seeded/bundled, 0 = user-created
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'singleton',
      default_weight_unit TEXT DEFAULT 'kg', -- used when creating new exercises
      theme TEXT DEFAULT 'system',
      rest_default_sec INTEGER DEFAULT 90,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout (
      id TEXT PRIMARY KEY,
      performed_at TEXT NOT NULL,            -- ISO date-time; for history
      duration_sec INTEGER,
      notes TEXT,                            -- session-wide note
      total_sets INTEGER DEFAULT 0,
      total_exercises INTEGER DEFAULT 0,
      total_volume_g INTEGER DEFAULT 0,      -- sum(weight_g * reps_x10/10)
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS workout_set (
      id TEXT PRIMARY KEY,
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      set_index INTEGER NOT NULL,            -- 1..N within that exercise in this workout
      set_type TEXT,                         -- normal | warmup | drop | failure ...
      reps_x10 INTEGER,                      -- 85 => 8.5 reps
      weight_g INTEGER,                      -- normalized grams (0 or NULL for pure bodyweight)
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY(workout_id) REFERENCES workout(id),
      FOREIGN KEY(exercise_id) REFERENCES exercise(id)
    );

    -- ======================
    -- Indexes
    -- ======================

    CREATE INDEX IF NOT EXISTS idx_exercise_name ON exercise(name);
    CREATE INDEX IF NOT EXISTS idx_ws_exercise_time ON workout_set(exercise_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_ws_workout ON workout_set(workout_id);
  `);

  // Ensure settings row exists
  const now = new Date().toISOString();
  db.runSync(
    `
    INSERT OR IGNORE INTO settings (id, default_weight_unit, theme, rest_default_secb, created_at, updated_at)
    VALUES ('singleton', 'kg', 'system', 90, 'nearest_2.5kg', ?, ?)
  `,
    now,
    now
  );
}

/** Convenience wrappers so React Query can await them */
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
