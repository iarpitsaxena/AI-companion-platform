# Project Documentation

This folder is a practical guide to understand the full app flow from UI action to persisted data and AI response.

## Recommended reading order

1. [Architecture Overview](01-architecture-overview.md)
2. [Database and Security](02-database-and-security.md)
3. [API Reference](03-api-reference.md)
4. [Frontend Pages and UX Flows](04-frontend-pages-and-ux.md)
5. [Chat Runtime Flow](05-chat-runtime-flow.md)

## If you need to understand quickly

- Overall structure and ownership boundaries: [01-architecture-overview.md](01-architecture-overview.md)
- What data is stored where and why: [02-database-and-security.md](02-database-and-security.md)
- Exact request/response behavior: [03-api-reference.md](03-api-reference.md)
- How pages map to features: [04-frontend-pages-and-ux.md](04-frontend-pages-and-ux.md)
- Message lifecycle and memory pipeline: [05-chat-runtime-flow.md](05-chat-runtime-flow.md)

## Source map

- Main app code: `src/`
- API routes: `src/app/api/**/route.ts`
- Chat orchestration route: `src/app/api/chat/send/route.ts`
- Chat support modules: `src/lib/chat/*`
- Long-term memory client: `src/lib/chroma-memory.ts`
- Schema + RLS: `supabase/schema.sql`

## Scope note

- `AI Companion Landing Page (2)/` is a reference/asset folder and not the runtime app source.
