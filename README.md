# AI Companion Platform

AI Companion Platform is a Next.js full-stack app where authenticated users create AI companions, chat with them, and manage companion-driven productivity data (notes and todos).

## What this project does

- Companion CRUD with personality/profile fields
- Real-time chat with persisted conversation history
- Natural-language task commands for notes and todos
- Optional long-term memory retrieval via Chroma Cloud
- Optional voice features (STT and TTS)
- History and analytics pages for engagement tracking

## End-to-end flow (high level)

1. User sends a message in `/chat/[companionId]`
2. `POST /api/chat/send` validates and stores the user message in Supabase
3. Route gathers short-term history + optional Chroma memory snippets
4. Route builds system context and calls Groq chat completions
5. Assistant reply is stored in Supabase and streamed to UI via realtime
6. Latest turn is optionally added to Chroma memory for future retrieval

## Tech stack

- App framework: Next.js App Router + TypeScript
- Auth: Clerk
- Primary DB + realtime: Supabase (Postgres + Realtime)
- LLM: Groq
- Long-term memory: Chroma Cloud (optional)
- Voice (optional): Deepgram (STT), ElevenLabs (TTS)

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure `.env.local` with required values

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

3. Create database schema in Supabase

- Execute `supabase/schema.sql` in Supabase SQL editor.

4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Optional features

### Long-term memory (Chroma)

```dotenv
FEATURE_CHROMA_MEMORY=true
CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=
CHROMA_COLLECTION=ai_companion_memory
```

### Speech-to-text (Deepgram)

```dotenv
FEATURE_STT=true
NEXT_PUBLIC_FEATURE_STT=true
DEEPGRAM_API_KEY=
```

### Text-to-speech (ElevenLabs)

```dotenv
FEATURE_TTS=true
NEXT_PUBLIC_FEATURE_TTS=true
ELEVENLABS_API_KEY=
```

## Repository map

- `src/app/*`: pages + API routes
- `src/components/*`: shared UI shell/navigation
- `src/lib/*`: auth, integrations, utility services
- `src/lib/chat/*`: task command and prompt builder modules
- `supabase/schema.sql`: tables, relationships, RLS policies
- `docs/*`: architecture and runtime documentation

## Documentation index

- Start here: [docs/README.md](docs/README.md)
- Architecture: [docs/01-architecture-overview.md](docs/01-architecture-overview.md)
- Data + security: [docs/02-database-and-security.md](docs/02-database-and-security.md)
- API details: [docs/03-api-reference.md](docs/03-api-reference.md)
- Frontend UX map: [docs/04-frontend-pages-and-ux.md](docs/04-frontend-pages-and-ux.md)
- Chat internals: [docs/05-chat-runtime-flow.md](docs/05-chat-runtime-flow.md)
