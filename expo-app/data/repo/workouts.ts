import { toGrams } from "@/data/db";
import type {
  ActiveWorkoutDraft,
  DraftExercise,
  DraftSet,
} from "@/types/draft";
import { randomUUID } from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

/** ---------- DB row types (mirror the normalized schema) ---------- */

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

export type WorkoutExerciseRow = {
  id: string;
  workout_id: string;
  exercise_id: string;
  notes: string | null;
  rest_time: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type WorkoutSetRow = {
  id: string;
  workout_exercise_id: string;
  set_index: number; // 1..N
  set_type: string | null; // normal | warmup | dropset | failure
  reps_x10: number | null; // 85 => 8.5 reps
  weight_g: number | null; // grams (0 for bodyweight)
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** ---------- Reads over COMPLETED workouts ---------- */

export async function getWorkoutById(
  db: SQLiteDatabase,
  id: string
): Promise<WorkoutRow | null> {
  return db.getFirstAsync<WorkoutRow>(
    `SELECT * FROM workout WHERE id = ? AND deleted_at IS NULL`,
    id
  );
}

export async function listWorkouts(
  db: SQLiteDatabase,
  limit = 50,
  offset = 0
): Promise<WorkoutRow[]> {
  return db.getAllAsync<WorkoutRow>(
    `SELECT * FROM workout
      WHERE deleted_at IS NULL
      ORDER BY performed_at DESC
      LIMIT ? OFFSET ?`,
    limit,
    offset
  );
}

/** Fetch a workout with its exercises and their sets */
export async function getWorkoutDetail(
  db: SQLiteDatabase,
  workoutId: string
): Promise<{
  workout: WorkoutRow | null;
  exercises: Array<
    WorkoutExerciseRow & {
      sets: WorkoutSetRow[];
    }
  >;
}> {
  const workout = await getWorkoutById(db, workoutId);
  if (!workout) return { workout: null, exercises: [] };

  const exercises = await db.getAllAsync<WorkoutExerciseRow>(
    `SELECT * FROM workout_exercise
      WHERE workout_id = ? AND deleted_at IS NULL
      ORDER BY created_at ASC`,
    workoutId
  );

  const withSets = await Promise.all(
    exercises.map(async (ex) => {
      const sets = await db.getAllAsync<WorkoutSetRow>(
        `SELECT * FROM workout_set
          WHERE workout_exercise_id = ? AND deleted_at IS NULL
          ORDER BY set_index ASC, created_at ASC`,
        ex.id
      );
      return { ...ex, sets };
    })
  );

  return { workout, exercises: withSets };
}

/** Delete a completed workout (cascades to workout_exercise and workout_set) */
export async function deleteWorkout(
  db: SQLiteDatabase,
  workoutId: string
): Promise<void> {
  await db.runAsync(`DELETE FROM workout WHERE id = ?`, workoutId);
}

/** ---------- Draft commit: the ONLY write-path from draft → DB ---------- */

/**
 * Commit a draft workout into SQLite as a COMPLETED workout.
 * - Inserts workout, workout_exercise, and workout_set rows in a single transaction.
 * - Computes totals and duration at commit time.
 * - Returns the new workout id (DB id, not the draft id).
 */
export async function commitDraftToDb(
  db: SQLiteDatabase,
  draft: ActiveWorkoutDraft
): Promise<string> {
  if (!draft) throw new Error("Invalid draft (null)");
  if (!draft.startedAt) throw new Error("Draft is missing startedAt");
  if (!Array.isArray(draft.exercises))
    throw new Error("Draft has no exercises");

  const workoutId = randomUUID();
  const nowIso = new Date().toISOString();

  // Aggregate totals from the draft
  let totalSets = 0;
  let totalVolumeG = 0;
  const totalExercises = draft.exercises.length;

  await db.withExclusiveTransactionAsync(async (tx) => {
    // 1) Insert workout shell (we'll update totals & duration after inserts)
    await tx.runAsync(
      `INSERT INTO workout
        (id, performed_at, duration_sec, notes, total_sets, total_exercises, total_volume_g, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?, ?, ?)`,
      workoutId,
      draft.startedAt,
      null,
      draft.notes ?? null,
      0,
      0,
      0,
      nowIso,
      nowIso
    );

    // 2) Insert each exercise and its sets
    for (const ex of draft.exercises as DraftExercise[]) {
      const workoutExerciseId = randomUUID();

      await tx.runAsync(
        `INSERT INTO workout_exercise
          (id, workout_id, exercise_id, notes, rest_time, created_at, updated_at)
         VALUES (?,?,?,?,?, ?, ?)`,
        workoutExerciseId,
        workoutId,
        ex.id,
        ex.notes ?? null,
        ex.restTime ?? 180,
        nowIso,
        nowIso
      );

      let setIndex = 0;
      for (const st of ex.sets as DraftSet[]) {
        setIndex++;

        const g =
          st.weight != null ? toGrams(st.unit ?? ex.unit, st.weight) : 0;
        const reps_x10 = st.reps != null ? Math.round(st.reps * 10) : 0;

        totalSets += 1;
        totalVolumeG += Math.round(g * (reps_x10 / 10));

        await tx.runAsync(
          `INSERT INTO workout_set
            (id, workout_exercise_id, set_index, set_type, reps_x10, weight_g, created_at, updated_at)
           VALUES (?,?,?,?,?,?, ?, ?)`,
          randomUUID(),
          workoutExerciseId,
          setIndex,
          st.type ?? "normal",
          reps_x10,
          g,
          nowIso,
          nowIso
        );
      }
    }

    // 3) Finalize totals + duration
    const durationSec = Math.max(
      0,
      Math.floor((Date.now() - Date.parse(draft.startedAt)) / 1000)
    );

    await tx.runAsync(
      `UPDATE workout
          SET duration_sec = ?,
              total_sets = ?,
              total_exercises = ?,
              total_volume_g = ?,
              updated_at = ?
        WHERE id = ?`,
      durationSec,
      totalSets,
      totalExercises,
      Math.round(totalVolumeG),
      nowIso,
      workoutId
    );
  });

  return workoutId;
}
