# Chat Runtime Flow (Detailed)

This document explains exactly what happens when a user chats with a companion.

## 1) Session boot

Page: `src/app/chat/[companionId]/page.tsx`

On load:

1. Calls `GET /api/chat/session?companionId=<id>`
2. API returns latest conversation for this companion (or none)
3. UI stores:
   - `conversationId`
   - existing message list

The message pane uses dedicated container scrolling (not page scrolling).

## 2) Realtime subscription

When `conversationId` exists:

- UI subscribes to Supabase realtime channel `conversation-<conversationId>`
- Listens for `INSERT` events on `messages` table
- Appends new message to local state and auto-scrolls
- Keeps conversation view synchronized with persisted assistant/user inserts

## 3) Sending a message

UI action -> `POST /api/chat/send` with:

- `companionId`
- `content`

UI behavior before server response:

- Adds optimistic local user message immediately
- Keeps input responsive while request is processing

Server (`chat/send` route) executes:

1. Validate payload (`zod`)
2. Verify companion ownership
3. Find latest conversation for companion/user or create a new one
4. Insert user message in `messages`
5. Try task command execution from user input (`src/lib/chat/task-commands.ts`)
   - notes: add/update/delete
   - todos: add/update/complete/reopen/delete
6. Load latest message history for context
7. Optional: query Chroma long-term memories (`src/lib/chroma-memory.ts`)
8. Build model input:
   - system prompt from companion metadata (`src/lib/chat/prompt-builders.ts`)
   - optional memory prompt
   - optional task result context
   - recent history
9. Call Groq chat completions API
10. If model output embeds a command, parse and attempt execution
11. Save assistant message to `messages`
12. Optional: store user+assistant turn in Chroma collection
13. Update conversation `updated_at`
14. Return assistant message + conversationId

## 4) Voice behavior

### STT (mic)

- UI can record audio and send to `/api/stt/deepgram`
- transcript is fed back into normal `sendContent` flow

### TTS (listen)

- UI sends assistant text to `/api/tts/elevenlabs`
- Response audio is played in browser

## 5) Task command parsing

Command parser accepts two styles:

1. Pipe commands (explicit):
   - `todo add | buy milk`
   - `note update | meeting notes | new text`

2. Natural language shortcuts:
   - `add todo buy milk`
   - `complete task buy milk`
   - `delete note meeting notes`

The route includes guardrails to avoid false success responses by checking update/delete targets.

Embedded command handling also exists: if assistant output contains a valid command, it can be executed server-side and appended to response context.

## 6) Message persistence and data ownership

- Every message is persisted in Supabase
- Message ownership is enforced via conversation ownership policy (RLS)
- Conversation deletion cascades to all related messages

Supabase is the transcript source-of-truth; Chroma is only retrieval memory.

## 7) Why chat can feel sensitive to layout

The chat route intentionally uses tighter scroll control than other pages:

- page/main scroll is restricted
- message pane has dedicated scroll
- sidebar behavior can be route-conditioned

So small wrapper class changes in shell/page can affect visible scroll behavior quickly.
