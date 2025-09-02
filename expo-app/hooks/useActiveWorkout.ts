// hooks/useActiveWorkout.ts
// React hook that orchestrates an active session while keeping SQL inside the repo.

import { toGrams } from "@/data/db";
import {
  addSetTx,
  cancelWorkout,
  finalizeWorkout,
  getActiveWorkout,
  listSetsForWorkout,
  recomputeTotals,
  startNewWorkout,
} from "@/data/repo/workouts";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";

export function useActiveWorkout() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [workoutId, setWorkoutId] = useState<string | undefined>();
  const startedMsRef = useRef<number | undefined>(undefined);

  // Resume an existing active workout if present
  useEffect(() => {
    (async () => {
      const active = await getActiveWorkout(db);
      if (active) {
        setWorkoutId(active.id);
        startedMsRef.current = Date.parse(active.performed_at);
      }
      setLoading(false);
    })();
  }, [db]);

  async function start() {
    console.log("[useActiveWorkout.start] called");
    const existing = await getActiveWorkout(db);
    console.log("[useActiveWorkout.start] existing active:", !!existing);
    if (existing) {
      setWorkoutId(existing.id);
      startedMsRef.current = Date.parse(existing.performed_at);
      return existing.id;
    }
    const row = await startNewWorkout(db);
    setWorkoutId(row.id);
    startedMsRef.current = Date.parse(row.performed_at);
    return row.id;
  }

  async function addSet(
    exerciseId: string,
    reps: number,
    weight: number,
    unit: "kg" | "lb",
    setType: string | null = "normal"
  ) {
    if (!workoutId) throw new Error("No active workout");
    await addSetTx(
      db,
      workoutId,
      exerciseId,
      Math.round(reps * 10),
      toGrams(unit, weight),
      setType
    );
  }

  async function finish() {
    if (!workoutId) throw new Error("No active workout");
    await finalizeWorkout(db, workoutId);
    const finishedId = workoutId;
    setWorkoutId(undefined);
    startedMsRef.current = undefined;
    return finishedId;
  }

  async function cancel() {
    if (!workoutId) return;
    await cancelWorkout(db, workoutId);
    setWorkoutId(undefined);
    startedMsRef.current = undefined;
  }

  async function getSets() {
    if (!workoutId) return [];
    return listSetsForWorkout(db, workoutId);
  }

  async function refreshTotals() {
    if (!workoutId) return;
    await recomputeTotals(db, workoutId);
  }

  const durationSec = startedMsRef.current
    ? Math.max(0, Math.floor((Date.now() - startedMsRef.current) / 1000))
    : 0;

  return {
    loading,
    workoutId,
    start,
    addSet,
    finish,
    cancel,
    getSets,
    refreshTotals,
    durationSec,
  } as const;
}
