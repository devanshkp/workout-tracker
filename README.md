## Frontend

- **React Native (Expo) + TypeScript** — cross-platform UI (iOS/Android), hot reload, OTA updates.
- **Expo Router** — navigation stacks & tabs.
- **UI**: `react-native-reanimated` for animations.
- **Forms/Validation**: React Hook Form + Zod.

## State & Data

- **Zustand (UI/ephemeral state)**
  - For things like timers, modals, selected exercise, draft set edits.
- **React Query (server/db state)**
  - Wraps async calls (SQLite queries or API).
  - Handles caching, background refetch, invalidation, retries.
- **SQLite (expo-sqlite)**
  - Local relational DB, main source of truth.
  - Stores exercises, workouts, sets, user profile, settings.
  - Schema includes `id`, `updated_at`, `deleted_at` for sync.

## Local Storage

- **MMKV** — ultra-fast key-value store for UI state (rest timer ticks), user settings, and other small bits of data.
- **Expo SecureStore** — secrets & tokens (auth, subscription receipts).
- **Expo FileSystem** — JSON or zipped SQLite export/import (backups, portability).
- **Expo Notifications** — rest timers, workout reminders.

## Cloud Sync / Backend (future, subscription feature)

- **Option A: Supabase** (Postgres + Auth + Storage + RLS)
  - SQL-based, powerful row-level security policies.
- **Option B: Firebase** (Auth + Firestore/RTDB + Storage)
  - Fast to integrate, schema-lite, offline cache.
- **Option C: Custom Node.js backend**
  - **Node.js + Fastify/Express** + **Postgres (Prisma)**.
  - Expose `/sync` endpoints for workouts/exercises.
  - Full control of logic, pricing, extensions.

_(Alt cloud DBs: Neon, PlanetScale, MongoDB Atlas.)_

## Auth & Paywall

- **Auth**: Supabase Auth / Firebase Auth / Custom JWT.
- **Subscriptions**: RevenueCat (cross-platform IAP).
- Free users: local data + JSON export.
- Paid users: cloud sync/restore + advanced analytics.

## Analytics & Quality

- **Sentry** — crash + performance monitoring.
- **PostHog / Amplitude** — product analytics (events like `workout_completed`).
- **Jest + React Native Testing Library** — unit & UI testing.
- **ESLint + Prettier + TypeScript** — code quality & consistency.

## Build & DevOps

- **Expo EAS** — builds, OTA updates, env secrets.
- **GitHub Actions** — CI (lint, tests), optional EAS triggers.
- **expo-assets** — app icons, splash screens.

## Charts / Data Viz

- **victory-native** or **react-native-svg-charts** — progress graphs, PR tracking.

## Suggested Data Model (SQLite tables)

**Exercises**

- `exercise_catalog(id, name, group, equipment, is_bodyweight, units, created_at, updated_at, deleted_at)`
- `user_exercise(id, catalog_id?, name, group, equipment, notes, created_at, updated_at, deleted_at)`

**Workouts**

- `workout(id, started_at, ended_at?, duration_sec, total_volume_g, notes, created_at, updated_at, deleted_at)`
- `workout_exercise(id, workout_id, exercise_ref, source CHECK('catalog'|'custom'), order_idx, created_at, updated_at, deleted_at)`
- `set(id, workout_exercise_id, set_type, weight_g?, reps_x10?, rpe_x10?, seconds?, created_at, updated_at, deleted_at)`

**User & Settings**

- `user_profile(id, display_name, email?, height_cm?, bodyweight_g?, created_at, updated_at, deleted_at)`
- `settings(id, units, rest_default_sec, theme, created_at, updated_at)`

## Flow

- **Zustand** manages UI state (timers, modals, selections).
- **React Query** wraps SQLite/HTTP queries and keeps caches fresh.
- **SQLite** stores persistent data.
- **FileSystem** handles export/import.
- **Backend (optional, paid feature)** syncs per-row changes based on `updated_at`.

---

## TL;DR (default stack)

- **App**: Expo React Native, TypeScript, React Navigation, NativeWind
- **State**: Zustand (UI), React Query (data)
- **Storage**: SQLite, MMKV, SecureStore, FileSystem
- **Backend (future)**: Supabase / Firebase / Node.js + Postgres
- **Payments**: RevenueCat (optional)
- **Quality**: Sentry, Jest, ESLint/Prettier/TS
- **Build**: Expo EAS, GitHub Actions
- **Charts**: victory-native
