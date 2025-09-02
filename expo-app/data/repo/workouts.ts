// SQLite data-access helpers for workout logging.
// Convention: an "active" workout has duration_sec IS NULL and deleted_at IS NULL.

import { randomUUID } from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

export type WorkoutRow = {
  id: string;
  performed_at: string; // ISO
  duration_sec: number | null;
  notes: string | null;
  total_sets: number;
  total_exercises: number;
  total_volume_g: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type WorkoutSetRow = {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_index: number;
  set_type: string | null;
  reps_x10: number | null;
  weight_g: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// --- Query helpers ---

export async function getActiveWorkout(
  db: SQLiteDatabase
): Promise<WorkoutRow | null> {
  return db.getFirstAsync<WorkoutRow>(
    `SELECT * FROM workout
      WHERE duration_sec IS NULL AND deleted_at IS NULL
      ORDER BY performed_at DESC
      LIMIT 1`
  );
}

export async function getWorkoutById(
  db: SQLiteDatabase,
  id: string
): Promise<WorkoutRow | null> {
  return db.getFirstAsync<WorkoutRow>(`SELECT * FROM workout WHERE id = ?`, id);
}

export async function listSetsForWorkout(
  db: SQLiteDatabase,
  workoutId: string
): Promise<WorkoutSetRow[]> {
  return db.getAllAsync<WorkoutSetRow>(
    `SELECT * FROM workout_set
      WHERE workout_id = ? AND deleted_at IS NULL
      ORDER BY exercise_id, set_index ASC, created_at ASC`,
    workoutId
  );
}

// --- Mutations ---

export async function startNewWorkout(db: SQLiteDatabase): Promise<WorkoutRow> {
  const id = randomUUID();
  const nowIso = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO workout
      (id, performed_at, duration_sec, notes, total_sets, total_exercises, total_volume_g, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?, ?, ?)`,
    id,
    nowIso,
    null,
    null,
    0,
    0,
    0,
    nowIso,
    nowIso
  );

  const row = await getWorkoutById(db, id);
  if (!row) throw new Error("Failed to create workout");
  return row;
}

export async function addSetTx(
  db: SQLiteDatabase,
  workoutId: string,
  exerciseId: string,
  reps_x10: number,
  weight_g: number,
  setType: string | null = "normal"
) {
  const nowIso = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (tx) => {
    const prev = await tx.getFirstAsync<{ max_idx: number }>(
      `SELECT COALESCE(MAX(set_index), 0) AS max_idx
         FROM workout_set
        WHERE workout_id = ? AND exercise_id = ? AND deleted_at IS NULL`,
      workoutId,
      exerciseId
    );
    const nextIndex = (prev?.max_idx ?? 0) + 1;

    await tx.runAsync(
      `INSERT INTO workout_set
         (id, workout_id, exercise_id, set_index, set_type, reps_x10, weight_g, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?, ?, ?)`,
      randomUUID(),
      workoutId,
      exerciseId,
      nextIndex,
      setType,
      reps_x10,
      weight_g,
      nowIso,
      nowIso
    );

    const volDelta = Math.round((weight_g ?? 0) * (reps_x10 / 10));
    await tx.runAsync(
      `UPDATE workout SET total_sets = total_sets + 1,
                          total_volume_g = total_volume_g + ?,
                          updated_at = ?
        WHERE id = ?`,
      volDelta,
      nowIso,
      workoutId
    );
  });
}

export async function updateSet(
  db: SQLiteDatabase,
  setId: string,
  fields: Partial<Pick<WorkoutSetRow, "set_type" | "reps_x10" | "weight_g">>
) {
  const nowIso = new Date().toISOString();
  const cols: string[] = [];
  const args: any[] = [];

  if (fields.set_type !== undefined) {
    cols.push("set_type = ?");
    args.push(fields.set_type);
  }
  if (fields.reps_x10 !== undefined) {
    cols.push("reps_x10 = ?");
    args.push(fields.reps_x10);
  }
  if (fields.weight_g !== undefined) {
    cols.push("weight_g = ?");
    args.push(fields.weight_g);
  }

  if (!cols.length) return;

  args.push(nowIso, setId);
  await db.runAsync(
    `UPDATE workout_set SET ${cols.join(", ")}, updated_at = ? WHERE id = ?`,
    ...args
  );
}

export async function deleteSet(db: SQLiteDatabase, setId: string) {
  await db.runAsync(`DELETE FROM workout_set WHERE id = ?`, setId);
}

export async function recomputeTotals(db: SQLiteDatabase, workoutId: string) {
  const totals = await db.getFirstAsync<{
    total_sets: number;
    total_exercises: number;
    total_volume_g: number;
  }>(
    `WITH agg AS (
       SELECT COUNT(*) AS total_sets,
              COUNT(DISTINCT exercise_id) AS total_exercises,
              COALESCE(SUM(weight_g * (reps_x10/10.0)), 0) AS total_volume_g
         FROM workout_set
        WHERE workout_id = ? AND deleted_at IS NULL
     )
     SELECT total_sets,
            total_exercises,
            CAST(total_volume_g AS INTEGER) AS total_volume_g
       FROM agg`,
    workoutId
  );

  const nowIso = new Date().toISOString();
  await db.runAsync(
    `UPDATE workout SET total_sets = ?, total_exercises = ?, total_volume_g = ?, updated_at = ? WHERE id = ?`,
    totals?.total_sets ?? 0,
    totals?.total_exercises ?? 0,
    totals?.total_volume_g ?? 0,
    nowIso,
    workoutId
  );
}

export async function finalizeWorkout(db: SQLiteDatabase, workoutId: string) {
  const row = await getWorkoutById(db, workoutId);
  if (!row) throw new Error("Workout not found");

  await recomputeTotals(db, workoutId);

  const startedMs = Date.parse(row.performed_at);
  const durationSec = Math.max(0, Math.floor((Date.now() - startedMs) / 1000));
  const nowIso = new Date().toISOString();

  await db.runAsync(
    `UPDATE workout SET duration_sec = ?, updated_at = ? WHERE id = ?`,
    durationSec,
    nowIso,
    workoutId
  );
}

export async function cancelWorkout(db: SQLiteDatabase, workoutId: string) {
  await db.runAsync(`DELETE FROM workout WHERE id = ?`, workoutId);
}
