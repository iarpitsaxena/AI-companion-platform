# Frontend Pages and UX Flows

## Public

### `/` (Landing)

- File: `src/app/page.tsx`
- Composed from landing components under `src/components/landing/*`
  - `src/components/landing/navbar.tsx`
  - `hero.tsx`, `features.tsx`, `cta-section.tsx`, `footer.tsx`

## Auth routes

- `/sign-in/[[...sign-in]]`
- `/sign-up/[[...sign-up]]`

## Shared authenticated shell

- File: `src/components/signed-layout.tsx`
- Provides:
  - sidebar navigation
  - responsive drawer
  - desktop collapse
  - global header controls
  - main content container

The shell also controls route-specific scroll behavior for companion chat.

## Authenticated pages

### `/dashboard`

- File: `src/app/dashboard/page.tsx`
- Aggregates data from companions, todos, notes, conversations
- Includes:
  - KPI cards
  - task quick actions
  - notes preview
  - productivity chart (`recharts`)
  - embedded quick chat widget

### `/companions`

- File: `src/app/companions/page.tsx`
- Top section: companion list + actions (chat/edit/duplicate/delete)
- Bottom section: create/edit form for companion profile fields

### `/chat`

- File: `src/app/chat/page.tsx`
- Companion picker grid; each card routes to `/chat/[companionId]`

### `/chat/[companionId]`

- File: `src/app/chat/[companionId]/page.tsx`
- Full conversation UI:
  - message stream with copy/listen controls
  - typing indicator
  - composer + send
  - optional STT/TTS controls
  - clear history action
  - task command help section
- Uses realtime insert subscription via Supabase browser client
- Uses optimistic user-message rendering before API response resolves

### `/notes`

- File: `src/app/notes/page.tsx`
- Create/update form + searchable note list

### `/todos`

- File: `src/app/todos/page.tsx`
- Add/update task + filter chips + list actions (toggle/edit/delete)

### `/history`

- File: `src/app/history/page.tsx`
- Conversation history with search/filter/export (TXT/JSON/PDF)

### `/analytics`

- File: `src/app/analytics/page.tsx`
- Displays aggregate metrics from `/api/analytics`

### `/profile`

- File: `src/app/profile/page.tsx`
- Embeds Clerk `UserProfile`

## Styling model

- Global styles in `src/app/globals.css`
- Reusable design primitives include:
  - `.card`, `.btn`, `.input`, `.select`, `.textarea`
  - chat-specific classes (`.chat-bubble*`, `.chat-window`, `.chat-composer`)
  - custom scrollbar class `.hamburger-scrollbar`

## Current UX caveat

The companion chat route has custom scroll-lock behavior in the shared shell. This is intentionally route-specific and may need periodic tuning if layout structure is edited.
