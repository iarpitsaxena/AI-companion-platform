# AI Companion Platform (MVP)

This repository contains an MVP implementation of an AI companion platform where users can:

- Sign up and log in
- Create/edit/delete/duplicate AI companions
- Chat in real time with persistent memory
- View conversation history and export chats (TXT/PDF/JSON)
- Manage notes and to-do lists
- View basic conversation analytics

## Tech Stack

- Frontend + backend: Next.js (App Router) + TypeScript
- Auth: Clerk
- DB + realtime + storage: Supabase
- LLM: Groq
- Planned integrations (env placeholders included): Chroma, ElevenLabs, Deepgram, Replicate

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
cp .env.example .env.local
```

3. Fill required variables in `.env.local`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`

4. Create Supabase schema:

- Run SQL from `supabase/schema.sql` in your Supabase SQL editor.

5. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Implemented MVP Features

- Authentication (register/login/logout) with Clerk routes
- User profile management via Clerk User Profile page
- Companion management with personality configuration
- Chat with persisted conversation memory
- Conversation history search/filter/delete/export
- Notes CRUD with search
- To-do CRUD with status filters
- Conversation analytics overview

## Optional Feature Flags

Enable advanced capabilities by setting the following in `.env.local`:

- `FEATURE_CHROMA_MEMORY=true` to enable long-term vector memory retrieval/store
- `FEATURE_STT=true` to enable Deepgram speech-to-text endpoint
- `FEATURE_TTS=true` to enable ElevenLabs text-to-speech endpoint
- `NEXT_PUBLIC_FEATURE_STT=true` to show mic controls in chat UI
- `NEXT_PUBLIC_FEATURE_TTS=true` to show listen controls in chat UI

### Chroma memory config

- `NEXT_PUBLIC_CHROMA_URL` (required when `FEATURE_CHROMA_MEMORY=true`)
- `CHROMA_API_KEY` (optional, if your Chroma host requires auth)
- `CHROMA_COLLECTION` (optional, default: `ai_companion_memory`)

### STT endpoint (Deepgram)

- `POST /api/stt/deepgram`
- `multipart/form-data` field: `audio`
- Optional form field: `model`
- Returns: `{ transcript, provider, model }`

### TTS endpoint (ElevenLabs)

- `POST /api/tts/elevenlabs`
- JSON body: `{ "text": "Hello", "voiceId": "...", "modelId": "..." }`
- Returns: `audio/mpeg` stream

## Project Structure

- `src/app/*`: UI pages and API routes
- `src/components/*`: app shell and navigation
- `src/lib/*`: auth, Supabase client, shared types
- `supabase/schema.sql`: DB schema and RLS policies

## Notes

- Current MVP uses text chat only.
- Voice (STT/TTS), avatar generation, and advanced memory/vector workflows are scaffolded at env level but not implemented in this pass.
