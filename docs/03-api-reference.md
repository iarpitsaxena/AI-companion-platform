# API Reference

All endpoints are in `src/app/api/**/route.ts` and protected by Clerk middleware/auth unless explicitly public.

## Companions

### `GET /api/companions`

- Returns all companions for current user (ordered by latest update)

### `POST /api/companions`

- Creates companion profile (validated with `zod`)

### `PATCH /api/companions/:id`

- Updates owned companion only

### `DELETE /api/companions/:id`

- Deletes owned companion

### `POST /api/companions/:id/duplicate`

- Clones companion as `"<name> Copy"`

## Conversations and messages

### `GET /api/conversations`

- Returns user conversations with companion context

### `DELETE /api/conversations?id=<conversationId>`

- Deletes owned conversation (message rows cascade)

### `GET /api/conversations/:id/messages`

- Ownership check + ordered message list

## Chat endpoints

### `GET /api/chat/session?companionId=<uuid>`

- Returns latest conversation for the companion + all messages
- If no conversation exists: `{ conversation: null, messages: [] }`

### `POST /api/chat/send`

Request body:

- `companionId: string` (uuid)
- `content: string`

Primary orchestration steps:

1. Validate payload and user auth
2. Verify companion ownership
3. Find or create conversation
4. Insert user message into Supabase
5. Execute task command from user text (if present)
6. Load recent message history
7. Query Chroma memory snippets (if enabled)
8. Build prompt context (`src/lib/chat/prompt-builders.ts`)
9. Call Groq completions API
10. Parse embedded task command from assistant output and execute if needed
11. Insert assistant message into Supabase
12. Store memory documents in Chroma (if enabled)
13. Update conversation timestamp

Response:

- `conversationId`
- `message` (assistant message row)

## Notes

### `GET /api/notes`

- Returns user notes sorted by recency

### `POST /api/notes`

- Create or update (`id` determines update mode)

### `DELETE /api/notes?id=<id>`

- Deletes owned note

## Todos

### `GET /api/todos?status=all|pending|completed`

- Returns filtered user todos

### `POST /api/todos`

- Create or update todo

### `DELETE /api/todos?id=<id>`

- Deletes owned todo

## Analytics

### `GET /api/analytics`

Returns aggregate dashboard metrics:

- `totalConversations`
- `totalMessages`
- `avgConversationLength`
- `mostActiveCompanion`

## Voice endpoints

### `POST /api/stt/deepgram`

- Requires `FEATURE_STT=true`
- Accepts multipart `audio`
- Returns transcript payload

### `POST /api/tts/elevenlabs`

- Requires `FEATURE_TTS=true`
- Accepts JSON `text` (+ optional voice/model params)
- Returns `audio/mpeg`

## Error conventions

- `400`: malformed input / validation failure
- `401`: unauthenticated
- `403`: feature disabled
- `404`: resource not found (ownership-aware)
- `500`: internal/db integration error
- `502`: upstream model/provider error
