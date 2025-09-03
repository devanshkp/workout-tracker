// types/draft.ts
export type DraftSet = {
  id: string; // temp uuid
  type: "warmup" | "normal" | "failure" | "dropset";
  reps: number; // in reps
  weight: number; // in unit below
  unit: "kg" | "lb";
  completed: boolean;
};

export type DraftExercise = {
  id: string; // exercise catalog id
  name: string; // denormalize for quick UI (optional)
  unit: "kg" | "lb";
  notes: string;
  restTime: number;
  sets: DraftSet[];
};

export type ActiveWorkoutDraft = {
  id: string; // temp uuid for the draft
  startedAt: string; // ISO
  notes: string;
  exercises: DraftExercise[];
};
