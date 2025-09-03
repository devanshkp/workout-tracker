// Draft-first orchestrator: active session lives in MMKV+Zustand,
// DB writes only happen on finish().

import { toGrams } from "@/data/db";
import { useWorkoutDraft } from "@/store/useWorkoutDraft";
import { commitDraftToDb } from "@/data/repo/workouts";
import type { DraftExercise } from "@/types/draft";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";

export function useActiveWorkout() {
  const db = useSQLiteContext();

  const {
    draft,
    startDraft,
    cancelDraft,
    addExercise,
    removeExercise,
    addSet: draftAddSet,
    updateSet: draftUpdateSet,
    removeSet: draftRemoveSet,
    setNotes,
    computeStats,
  } = useWorkoutDraft();

  const [tick, setTick] = useState(0); // to keep durationSec moving once per second

  // start a 1s ticker so durationSec updates
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const workoutId = draft?.id;
  const loading = false;

  const durationSec = useMemo(() => {
    if (!draft?.startedAt) return 0;
    return Math.max(
      0,
      Math.floor((Date.now() - Date.parse(draft.startedAt)) / 1000)
    );
  }, [draft?.startedAt, tick]);

  /** Ensure a draft exists (id returned only for parity) */
  async function start() {
    if (!draft) startDraft();
    return draft?.id ?? "";
  }

  /** Add a set to an exercise in the draft */
  async function addSet(
    exerciseId: string,
    reps: number,
    weight: number,
    unit: "kg" | "lb",
    setType: string | null = "normal"
  ) {
    if (!draft) throw new Error("No active draft");
    draftAddSet(exerciseId, {
      reps,
      weight,
      unit,
      type: (setType as any) ?? "normal",
      completed: false,
    });
  }

  /** Finish: commit the draft into SQLite and clear it */
  async function finish() {
    if (!draft) throw new Error("No active draft");
    const id = await commitDraftToDb(db, draft);
    cancelDraft();
    return id;
  }

  /** Cancel: drop the draft without DB writes */
  async function cancel() {
    if (!draft) return;
    cancelDraft();
  }

  /**
   * Each item looks like:
   * { id, workout_id (draft id), exercise_id, set_index, set_type, reps_x10, weight_g, created_at/updated_at }
   */
  async function getSets() {
    if (!draft) return [];
    const rows: Array<{
      id: string;
      workout_id: string;
      exercise_id: string;
      set_index: number;
      set_type: string | null;
      reps_x10: number | null;
      weight_g: number | null;
      created_at: string;
      updated_at: string;
      deleted_at: null;
    }> = [];

    const nowIso = new Date().toISOString();
    for (const ex of draft.exercises as DraftExercise[]) {
      let idx = 0;
      for (const st of ex.sets) {
        idx += 1;
        rows.push({
          id: st.id,
          workout_id: draft.id,
          exercise_id: ex.id,
          set_index: idx,
          set_type: st.type ?? "normal",
          reps_x10: st.reps != null ? Math.round(st.reps * 10) : null,
          weight_g:
            st.weight != null ? toGrams(st.unit ?? ex.unit, st.weight) : null,
          created_at: nowIso,
          updated_at: nowIso,
          deleted_at: null,
        });
      }
    }
    return rows;
  }


  return {
    // parity with old hook:
    loading,
    workoutId, // draft id while active
    start,
    addSet,
    finish,
    cancel,
    getSets,
    durationSec,

    // bonus helpers you may find handy in the screen:
    addExercise,
    removeExercise,
    updateSet: draftUpdateSet,
    removeSet: draftRemoveSet,
    setNotes,
    draft, // expose raw draft if you want to render directly
    stats: computeStats(),
  } as const;
}
