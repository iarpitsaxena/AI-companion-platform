# Database and Security

Primary SQL schema is defined in `supabase/schema.sql`.

## SQL data model (Supabase)

### `companions`

- User-owned companion profiles and behavior configuration
- Includes persona fields (`traits`, `communication_style`, `custom_prompt`, etc.)

### `conversations`

- User-owned conversation containers bound to a specific companion
- Drives chat session continuity and timestamps

### `messages`

- Per-turn chat records (both user and assistant)
- Columns: `conversation_id`, `role`, `content`, `created_at`
- This table is your canonical chat transcript and realtime source

### `notes`

- User-owned note records

### `todos`

- User-owned task records with completion state

## Relationships

- `conversations.companion_id -> companions.id` (cascade delete)
- `messages.conversation_id -> conversations.id` (cascade delete)

Implication: deleting a companion removes related conversations and all messages.

## Row Level Security (RLS)

RLS is enabled for all domain tables.

### Ownership policies

- `companions`, `conversations`, `notes`, `todos`:
  - `auth.uid()::text = user_id`

### Nested ownership for `messages`

- Access allowed only if related `conversation.user_id = auth.uid()::text`

This prevents cross-user message access even when a message ID is known.

## Realtime

- `messages` table is added to `supabase_realtime` publication.
- Chat page subscribes to inserts for current conversation channel.

This is why assistant replies appear immediately after insert without polling.

## Auth integration

- API routes call `requireUserId()` from `src/lib/auth.ts`.
- This uses Clerk server auth and throws if unauthenticated.

## Client choices

- `getSupabaseAdmin()` uses `SUPABASE_SERVICE_ROLE_KEY` for server routes.
- `getSupabaseBrowser()` uses public URL/anon key for browser realtime subscription use cases.

## Long-term memory store (Chroma)

Chroma is separate from Supabase and used only for retrieval-augmented memory:

- Stores vectorized memory documents + metadata per message turn
- Filters by `user_id` and `companion_id`
- Queried during chat response generation for relevant past snippets

Supabase remains the source-of-truth transcript; Chroma is a semantic recall layer.

## Practical implications

- Even if a user guesses another row ID, RLS + route filters prevent cross-user access.
- Deleting a companion cascades related conversations and messages.
- Memory retrieval quality depends on the embedding strategy used in `src/lib/chroma-memory.ts`.
