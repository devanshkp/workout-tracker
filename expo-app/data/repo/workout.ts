import { dbAll, dbFirst, dbRun } from "../db";

export type WorkoutRow = {
  id: string;
  performed_at: string;
  duration_sec: number | null;
  notes: string | null;
  total_sets: number;
  total_exercises: number;
  total_volume_g: number;
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
};

export async function createWorkout(input: {
  id: string;
  performed_at?: string; // ISO; default now
  duration_sec?: number | null;
  notes?: string | null;
}) {
  const now = new Date().toISOString();
  const performedAt = input.performed_at ?? now;
  await dbRun(
    `INSERT INTO workout (id, performed_at, duration_sec, notes, total_sets, total_exercises, total_volume_g, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)`,
    input.id,
    performedAt,
    input.duration_sec ?? null,
    input.notes ?? null,
    now,
    now
  );
}

export async function addWorkoutSet(input: {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_index: number;
  set_type?: string | null;
  reps_x10: number | null;
  weight_g: number | null;
}) {
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO workout_set
     (id, workout_id, exercise_id, set_index, set_type, reps_x10, weight_g, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?, ?, ?)`,
    input.id,
    input.workout_id,
    input.exercise_id,
    input.set_index,
    input.set_type ?? null,
    input.reps_x10 ?? null,
    input.weight_g ?? null,
    now,
    now
  );
}

export async function finishWorkout(workoutId: string) {
  // Aggregate totals from rows actually inserted
  const totals = await dbFirst<{
    total_sets: number;
    total_exercises: number;
    total_volume_g: number;
  }>(
    `
    SELECT
      COUNT(*) AS total_sets,
      COUNT(DISTINCT exercise_id) AS total_exercises,
      CAST(ROUND(SUM(COALESCE(weight_g,0) * (COALESCE(reps_x10,0) / 10.0))) AS INTEGER) AS total_volume_g
    FROM workout_set
    WHERE workout_id = ?
  `,
    workoutId
  );

  const now = new Date().toISOString();
  await dbRun(
    `UPDATE workout
     SET total_sets = ?, total_exercises = ?, total_volume_g = ?, updated_at = ?
     WHERE id = ?`,
    totals?.total_sets ?? 0,
    totals?.total_exercises ?? 0,
    totals?.total_volume_g ?? 0,
    now,
    workoutId
  );
}

export async function getWorkout(id: string): Promise<WorkoutRow | undefined> {
  return dbFirst<WorkoutRow>(
    `
    SELECT id, performed_at, duration_sec, notes, total_sets, total_exercises, total_volume_g
    FROM workout WHERE id = ? AND deleted_at IS NULL
  `,
    id
  );
}

export async function getSetsForWorkout(
  workoutId: string
): Promise<WorkoutSetRow[]> {
  return dbAll<WorkoutSetRow>(
    `
    SELECT id, workout_id, exercise_id, set_index, set_type, reps_x10, weight_g, created_at
    FROM workout_set
    WHERE workout_id = ?
    ORDER BY exercise_id ASC, set_index ASC
  `,
    workoutId
  );
}

/** Last time a specific exercise was performed (workout + when) */
export async function getLastWorkoutForExercise(
  exerciseId: string
): Promise<{ workout_id: string; performed_at: string } | undefined> {
  return dbFirst<{ workout_id: string; performed_at: string }>(
    `
    SELECT w.id AS workout_id, w.performed_at
    FROM workout_set s
    JOIN workout w ON w.id = s.workout_id
    WHERE s.exercise_id = ?
    ORDER BY w.performed_at DESC
    LIMIT 1
  `,
    exerciseId
  );
}

/** Sets for the most recent workout where this exercise appeared */
export async function getLastSetsForExercise(
  exerciseId: string
): Promise<WorkoutSetRow[]> {
  const last = await getLastWorkoutForExercise(exerciseId);
  if (!last) return [];
  return dbAll<WorkoutSetRow>(
    `
    SELECT id, workout_id, exercise_id, set_index, set_type, reps_x10, weight_g, created_at
    FROM workout_set
    WHERE workout_id = ? AND exercise_id = ?
    ORDER BY set_index ASC
  `,
    last.workout_id,
    exerciseId
  );
}
