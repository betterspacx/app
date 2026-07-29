# AGENTS.md

## Commands

| Command | Action |
|---|---|
| `pnpm run dev` | Dev server (forced webpack, not Turbopack) |
| `pnpm run build` | `drizzle-kit generate` → `next build --webpack` |
| `pnpm run start` | Production server |
| `pnpm run lint` | ESLint 9 flat config (`eslint.config.mjs`) |
| `pnpm run lint:fix` | Auto-fix |
| `pnpm run db:generate` | Drizzle schema → migration |
| `pnpm run db:push` | Drizzle push to local dev.db |
| `pnpm run db:migrate` | Drizzle migration (for D1 deployment) |
| `pnpm run db:studio` | Drizzle Studio UI |
| `pnpm run upload-to-r2` | Upload specific asset to R2 (via `tsx`) |
| `pnpm run upload-all-to-r2` | Bulk upload all assets to R2 (via `tsx`) |

`pnpm install` enforced via `only-allow pnpm` preinstall hook.

## Structure

- **`app/page.tsx`** — editor entrypoint (single-page app at `/`). No `/editor` route.
- **`app/api/`** — 8 routes: `upload-url`, `upload-video`, `image-proxy`, `screenshot`, `cleanup-cache`, `export`, `storage`, `tweet`.
- **`app/login/`**, **`app/signup/`** — Supabase auth pages. Client in `lib/supabase/client.ts`, service in `lib/supabase/auth-service.ts`. Auth callback at `app/auth/callback/route.ts`.
- **`lib/store/index.ts`** — dual Zustand stores: `useImageStore` (design state + zundo undo/redo) and `useEditorStore` (canvas rendering). Synced by `EditorStoreSync`.
- **`lib/schema.ts`** vs **`drizzle/schema.ts`** — two similar Drizzle SQLite schemas. `drizzle/schema.ts` used by `lib/db.ts` (D1 factory) and `drizzle.config.ts`. `lib/schema.ts` is standalone (for D1 Workers).
- **`lib/export/`** — image export (`export-service.ts`), video pipeline (FFmpeg WASM, WebCodecs, MediaRecorder). Web Workers in `lib/workers/`.
- **`lib/animation/`** — keyframe interpolation, 20+ presets, easing functions.
- **`lib/storage-service.ts`** — hybrid IndexedDB + R2 storage: presigned uploads, project persistence (`lib/project-manager.ts`), draft autosave (`lib/draft-storage.ts`).
- **`components/editor/`** — `EditorLayout`, `EditorHeader`, `EditorContent`, `LeftEditPanel`, `RightSettingsPanel`.
- **`components/timeline/`** — animation timeline UI, `useTimelinePlayback` hook.
- **`components/ui/`** — 33 shadcn/ui components (new-york style). Uses `cn()` from `lib/utils.ts`.
- **`extension/`** — Chrome extension (MV3) for screen recording. Separate deployable, not part of Next build.
- **`hooks/`** — `useExport`, `useAutosaveDraft`, `useCachedImage`, `useExportProgress`, etc.
- **`types/`** — `canvas.ts`, `editor.ts`, `animation.ts`, `mockup.ts`.

## Conventions

- **CSS** — Tailwind CSS 4 (`@tailwindcss/postcss`). Theme variables only (`bg-background`, `text-foreground`, `border-border`). All tokens in `app/globals.css`. `.dark` class on `<html>` by default.
- **React** — functional components, hooks, `'use client'` on client components, named exports. React Compiler enabled.
- **File naming** — `PascalCase.tsx` for components, `kebab-case.ts` for utilities.
- **TypeScript** — strict mode, `@/*` path alias. No `any` (use `unknown`). Avoid default exports.
- **Prettier** — `.prettierrc`: single quotes, trailing commas (es5), printWidth 120, 2-space tabs.
- **License headers** — every modified file must have `// Modified by konlyzx (2026) - ...` on line 1. New files get `// Created by konlyzx ...` + Apache 2.0 attribution.
- **`react-konva`** requires webpack external `{ canvas: 'canvas' }`. Dev forces `--webpack` for this reason.

## Build & Quirks

- `pnpm run build` always runs `drizzle-kit generate` first. For a fast type/lint check: `next build --webpack`.
- FFmpeg WASM video export needs `SharedArrayBuffer`. COOP/COEP headers set on `/home` (redirects to `/`). `/editor/:path*` headers in `next.config.ts` but no matching route.
- Backgrounds: gradients/solids are local CSS; raycast/paper/mesh/pattern backgrounds from Cloudflare R2.
- PostHog reverse-proxied via `/svc/:path*` rewrites (bypass ad blockers).
- Screenshot API (`app/api/screenshot/route.ts`): Playwright + Chromium locally (`npx playwright install chromium`). Falls back to `@sparticuz/chromium` on Vercel. Vercel config: 10s / 1024 MB.
- DB (Drizzle + SQLite/D1) is **unused at runtime**. Only used locally via `dev.db` (drizzle push/studio).
- No test framework or test files. Manual verification only.
- `.env.example` is minimal; full env var reference in `ENVIRONMENT_VARIABLES.md`.
- `scripts/` directory gitignored (no local copy). Upload scripts run via `tsx`.
- No CI workflows configured.
- `.claude/skills/` tracked — 11 skill directories available for agent injection.
