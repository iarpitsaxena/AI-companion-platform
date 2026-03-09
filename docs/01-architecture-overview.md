# Architecture Overview

## Core stack

- Framework: Next.js App Router + TypeScript
- Authentication: Clerk
- Primary data store: Supabase Postgres
- Realtime updates: Supabase Realtime (`messages` inserts)
- LLM provider: Groq Chat Completions
- Optional memory: Chroma Cloud (`chromadb` CloudClient)
- Optional voice: Deepgram (STT), ElevenLabs (TTS)

## Layered architecture

1. UI + Routing (`src/app/**`, `src/components/**`)
   - Public landing and authenticated app shell
   - Feature pages: dashboard, companions, chat, notes, todos, history, analytics, profile

2. API Controllers (`src/app/api/**/route.ts`)
   - Request validation and auth checks
   - Endpoint-specific orchestration

3. Domain/Service modules (`src/lib/**`)
   - Auth and Supabase clients
   - Chat helper modules (`src/lib/chat/*`)
   - Long-term memory client (`src/lib/chroma-memory.ts`)
   - Feature flags and shared types

4. Data layer (`supabase/schema.sql`)
   - Tables + relationships + RLS policies

## Important runtime modules

- Main chat orchestrator: `src/app/api/chat/send/route.ts`
- Task command parsing/execution: `src/lib/chat/task-commands.ts`
- Prompt construction: `src/lib/chat/prompt-builders.ts`
- Chroma memory query/store: `src/lib/chroma-memory.ts`

## Route model

- Public route: `/`
- Protected UI routes: `/dashboard`, `/companions`, `/chat`, `/chat/[companionId]`, `/notes`, `/todos`, `/history`, `/analytics`, `/profile`
- Protected APIs: `/api/**`

Auth enforcement occurs in `src/middleware.ts` and server-side route guards (`requireUserId`).

## App shell model

`src/components/signed-layout.tsx` manages:

- Sidebar navigation (desktop collapse + mobile drawer)
- Shared header actions
- Main content wrapper and route-specific scroll behavior

The companion chat route has stricter scroll constraints to keep message-pane behavior stable.

## Canonical request flow examples

Todo update path:

`/todos UI -> /api/todos -> zod validation -> Supabase mutation -> UI refresh`

Chat path:

`/chat/[companionId] UI -> /api/chat/send -> save user message -> task command pass -> gather context + memories -> Groq -> save assistant -> optional memory store -> realtime render`

## Feature flags

From `src/lib/feature-flags.ts`:

- `FEATURE_CHROMA_MEMORY`
- `FEATURE_STT`
- `FEATURE_TTS`
- `FEATURE_VOICE_CHAT`

Missing values currently default to enabled (`true`).
