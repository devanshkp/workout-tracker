import type {
  ActiveWorkoutDraft,
  DraftExercise,
  DraftSet,
} from "@/types/draft";
import { randomUUID } from "expo-crypto";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const storage = new MMKV();

const storageWrapper = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

type DraftState = {
  draft: ActiveWorkoutDraft | null;
  startDraft: () => void;
  cancelDraft: () => void;
  setNotes: (notes: string) => void;

  addExercise: (ex: { id: string; name: string; unit: "kg" | "lb" }) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, init?: Partial<Omit<DraftSet, "id">>) => string;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<DraftSet>
  ) => void;
  removeSet: (exerciseId: string, setId: string) => void;

  // helpers
  computeStats: () => {
    totalExercises: number;
    totalSets: number;
    totalVolumeKg: number;
  };
};

export const useWorkoutDraft = create<DraftState>()(
  persist(
    (set, get) => ({
      draft: null,

      startDraft: () =>
        set({
          draft: {
            id: randomUUID(),
            startedAt: new Date().toISOString(),
            notes: "",
            exercises: [],
          },
        }),

      cancelDraft: () => set({ draft: null }),

      setNotes: (notes) =>
        set((s) => (s.draft ? { draft: { ...s.draft, notes } } : s)),

      addExercise: ({ id, name, unit }) =>
        set((s) => {
          if (!s.draft) return s;
          if (s.draft.exercises.some((e) => e.id === id)) return s;
          const ex: DraftExercise = {
            id,
            name,
            unit,
            notes: "",
            restTime: 180,
            sets: [],
          };
          return {
            draft: { ...s.draft, exercises: [...s.draft.exercises, ex] },
          };
        }),

      removeExercise: (exerciseId) =>
        set((s) => {
          if (!s.draft) return s;
          return {
            draft: {
              ...s.draft,
              exercises: s.draft.exercises.filter((e) => e.id !== exerciseId),
            },
          };
        }),

      addSet: (exerciseId, init) => {
        const id = randomUUID();
        set((s) => {
          if (!s.draft) return s;
          return {
            draft: {
              ...s.draft,
              exercises: s.draft.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: [
                        ...ex.sets,
                        {
                          id,
                          type: init?.type ?? "normal",
                          reps: init?.reps ?? 0,
                          weight: init?.weight ?? 0,
                          unit: init?.unit ?? ex.unit,
                          completed: init?.completed ?? false,
                        },
                      ],
                    }
                  : ex
              ),
            },
          };
        });
        return id;
      },

      updateSet: (exerciseId, setId, patch) =>
        set((s) => {
          if (!s.draft) return s;
          return {
            draft: {
              ...s.draft,
              exercises: s.draft.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((st) =>
                        st.id === setId ? { ...st, ...patch } : st
                      ),
                    }
                  : ex
              ),
            },
          };
        }),

      removeSet: (exerciseId, setId) =>
        set((s) => {
          if (!s.draft) return s;
          return {
            draft: {
              ...s.draft,
              exercises: s.draft.exercises.map((ex) =>
                ex.id === exerciseId
                  ? { ...ex, sets: ex.sets.filter((st) => st.id !== setId) }
                  : ex
              ),
            },
          };
        }),

      computeStats: () => {
        const s = get();
        const d = s.draft;
        if (!d) return { totalExercises: 0, totalSets: 0, totalVolumeKg: 0 };
        const totalExercises = d.exercises.length;
        let totalSets = 0;
        let totalVolumeKg = 0;
        for (const ex of d.exercises) {
          totalSets += ex.sets.length;
          for (const st of ex.sets) {
            const kg = st.unit === "kg" ? st.weight : st.weight * 0.45359237;
            totalVolumeKg += kg * st.reps;
          }
        }
        return {
          totalExercises,
          totalSets,
          totalVolumeKg: Math.round(totalVolumeKg * 1000) / 1000,
        };
      },
    }),
    {
      name: "active-workout-draft",
      storage: createJSONStorage(() => storageWrapper),
      // version: 1, migrate: (persisted) => persisted
    }
  )
);
