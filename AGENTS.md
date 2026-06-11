# AGENTS.md

## Commands

| Command | Action |
|---------|--------|
| `pnpm run dev` | Start dev server (forced webpack, not Turbopack) |
| `pnpm run build` | DB codegen → Next build |
| `pnpm run lint` | ESLint 9 flat config |
| `pnpm run lint:fix` | Auto-fix |
| `pnpm run db:generate` | Drizzle schema → migration |
| `pnpm run db:push` | Drizzle push to dev.db |
| `pnpm run db:migrate` | Drizzle migration (for D1 deployment) |
| `pnpm run db:studio` | Drizzle Studio UI |
| `pnpm start` | Production server |

`pnpm install` enforced via `only-allow pnpm` preinstall hook.

## Structure

- **`app/page.tsx`** — editor (single-page app root at `/`). No `/editor` route exists.
- **`lib/store/index.ts`** — dual Zustand stores: `useImageStore` (design state, temporal undo/redo via zundo) and `useEditorStore` (canvas rendering). Synced by `EditorStoreSync`.
- **`lib/export/`** — image export (`export-service.ts`), video export pipeline, 3 encoders (FFmpeg WASM, WebCodecs, MediaRecorder). Web Workers in `lib/workers/`.
- **`lib/storage-service.ts`** — hybrid IndexedDB (local fallback) + R2 (cloud) storage for presigned uploads, project persistence (`lib/project-manager.ts`), and draft autosave (`lib/draft-storage.ts`).
- **`lib/constants/`** — aspect ratios, backgrounds (gradient/solid/image), fonts, preset config.
- **`lib/animation/`** — keyframe interpolation, 20+ presets, easing functions.
- **lib/schema.ts** vs **`drizzle/schema.ts`** — two similar Drizzle SQLite schemas. `drizzle/schema.ts` is referenced by `lib/db.ts` and `drizzle.config.ts`. `lib/schema.ts` is standalone (for D1 Workers).
- **`components/timeline/`** — animation timeline UI, playback via `useTimelinePlayback` hook.
- **`components/editor/`** — `EditorLayout`, `EditorHeader`, `EditorContent`, `LeftEditPanel` (3 tabs: Frame / Size / BG; Frame tab contains all editing: Style, Border, Shadow, Text, Draw, Filters, Code, Tweet as collapsible sections), `RightSettingsPanel` (3D / Layers / Motion).
- **`extension/`** — Chrome extension (MV3) for screen recording, uploads to editor via API.
- **`app/api/`** — `upload-url` (presigned R2 upload), `upload-video` (Chrome ext direct upload), `image-proxy` (CORS-safe R2 proxy), `screenshot` (Playwright + Chromium), `cleanup-cache`, `export`, `storage`, `tweet`.
- **`app/login/`**, **`app/signup/`** — Firebase auth pages. Auth service in `lib/auth-service.ts`, Firebase init in `lib/firebase.ts`.

## Conventions

- **CSS** — Tailwind CSS 4 (`@tailwindcss/postcss`). Theme variables only (`bg-background`, `text-foreground`, `border-border`). All tokens in `app/globals.css` (`.dark` class on `<html>` by default).
- **React** — functional components, hooks, `'use client'` for client components, named exports. React Compiler enabled (let it optimize memoization).
- **File naming** — `PascalCase.tsx` for components, `kebab-case.ts` for utilities.
- **TypeScript** — strict mode, `@/*` path alias. No `any` (use `unknown`). Avoid default exports.
- **Apache 2.0 License** — every modified existing source file must have a `// Modified by konlyzx (2026) - ...` header on line 1 (before `"use client"`). New files get `// Created by konlyzx ...` + `// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)`. See `.cursor/rules/apache-2-license-compliance.mdc`.
- **`react-konva`** requires webpack externals (`canvas: 'canvas'` per `next.config.ts`). This is why dev forces `--webpack`.

## Build Quirks

- `pnpm run build` always runs `drizzle-kit generate` first. For a fast type/lint check, use `next build --webpack` directly.
- FFmpeg WASM video export requires `SharedArrayBuffer`. COOP/COEP headers in `next.config.ts` are set for **`/home`** (redirects to `/`). The `/editor/:path*` header pattern is stale (no such route).
- Backgrounds: gradients and solids are local CSS; raycast/paper/mesh/pattern backgrounds are served from Cloudflare R2.
- PostHog is reverse-proxied via `/svc/:path*` rewrites (bypass ad blockers).
- Screenshot API (`app/api/screenshot/route.ts`) uses Playwright + Chromium locally. Requires browser binaries: `npx playwright install chromium`. Falls back to `@sparticuz/chromium` on Vercel.
- DB (Drizzle + SQLite/D1) is **unused at runtime**. Local dev only uses `dev.db` via Drizzle push/studio.
- No tests exist. No test framework installed. Manual verification required.
- `scripts/` directory is gitignored. Upload scripts (`upload-to-r2`, `upload-all-to-r2`, etc.) are defined in `package.json` and run via `tsx`.
- `.env.example` is minimal; full env var reference in `ENVIRONMENT_VARIABLES.md`.
