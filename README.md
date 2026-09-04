# ReelCraft

**AI Stories. Viral Videos.**

Local-first AI short-video creation for YouTube Shorts and Instagram Reels.

## Phase 1

Frontend application shell, creation workflow UI, local draft storage, Prisma schema, and AI provider abstractions. No paid AI APIs. Generation providers are modular stubs marked unavailable until Phase 2.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (schema prepared)
- Local storage for Phase 1 drafts

## Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

## Useful scripts

```bash
npm run typecheck
npm run lint
npm run db:generate
```

## Architecture notes

- UI lives under `src/app` and `src/components`
- AI interfaces: `src/services/ai`
- FFmpeg renderer abstraction: `src/services/video/renderer.ts`
- Drafts: `src/services/storage/local-store.ts`
- Database schema: `prisma/schema.prisma`
