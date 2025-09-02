import { dbAll, dbFirst, dbRun } from "../db";

export type ExerciseRow = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  is_bodyweight: 0 | 1;
  unit: "kg" | "lb";
  notes: string | null;
  is_system: 0 | 1;
};

export async function listExercises(limit = 300): Promise<ExerciseRow[]> {
  return dbAll<ExerciseRow>(
    `
    SELECT id, name, muscle_group, equipment, is_bodyweight, unit, notes, is_system
    FROM exercise
    WHERE deleted_at IS NULL
    ORDER BY is_system DESC, name ASC
    LIMIT ?
  `,
    limit
  );
}

export async function searchExercises(
  term: string,
  limit = 100
): Promise<ExerciseRow[]> {
  const like = `%${term.trim()}%`;
  return dbAll<ExerciseRow>(
    `
    SELECT id, name, muscle_group, equipment, is_bodyweight, unit, notes, is_system
    FROM exercise
    WHERE deleted_at IS NULL
      AND (name LIKE ? OR muscle_group LIKE ? OR equipment LIKE ? OR notes LIKE ?)
    ORDER BY is_system DESC, name COLLATE NOCASE ASC
    LIMIT ?
  `,
    like,
    like,
    like,
    like,
    limit
  );
}

export async function getExercise(
  id: string
): Promise<ExerciseRow | undefined> {
  return dbFirst<ExerciseRow>(
    `
    SELECT id, name, muscle_group, equipment, is_bodyweight, unit, notes, is_system
    FROM exercise
    WHERE id = ? AND deleted_at IS NULL
  `,
    id
  );
}

export async function createExercise(input: {
  id: string;
  name: string;
  muscle_group?: string | null;
  equipment?: string | null;
  is_bodyweight?: boolean;
  unit?: "kg" | "lb";
  notes?: string | null;
}) {
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO exercise
     (id, name, muscle_group, equipment, is_bodyweight, unit, notes, is_system, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    input.id,
    input.name,
    input.muscle_group ?? null,
    input.equipment ?? null,
    input.is_bodyweight ? 1 : 0,
    input.unit ?? "kg",
    input.notes ?? null,
    0,
    now,
    now
  );
}

export async function updateExerciseNotes(id: string, notes: string | null) {
  const now = new Date().toISOString();
  await dbRun(
    `UPDATE exercise SET notes = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    notes,
    now,
    id
  );
}

export async function updateExerciseUnit(id: string, unit: "kg" | "lb") {
  const now = new Date().toISOString();
  await dbRun(
    `UPDATE exercise SET unit = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    unit,
    now,
    id
  );
}

export async function getExerciseById(
  id: string
): Promise<ExerciseRow | undefined> {
  return getExercise(id);
}
