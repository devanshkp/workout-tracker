import { db, dbFirst, dbRun } from '../db';
import catalog from './exercises.json';

export async function seedExercisesIfEmpty() {
  const row = await dbFirst<{ c: number }>(`SELECT COUNT(*) as c FROM exercise WHERE is_system = 1`);
  if ((row?.c ?? 0) > 0) return;

  const now = new Date().toISOString();
  db.execSync('BEGIN');
  try {
    for (const ex of catalog as any[]) {
      await dbRun(
        `INSERT OR IGNORE INTO exercise
         (id, name, muscle_group, equipment, is_bodyweight, unit, notes, is_system, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        ex.id,
        ex.name,
        ex.muscleGroup ?? null,
        ex.equipment ?? null,
        ex.isBodyWeight ? 1 : 0,
        ex.unit ?? 'kg',
        ex.notes ?? null,
        1,
        now, now
      );
    }
    db.execSync('COMMIT');
  } catch (e) {
    db.execSync('ROLLBACK');
    throw e;
  }
}
