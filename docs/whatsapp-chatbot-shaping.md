---
shaping: true
---

# WhatsApp Chatbot -- Shaping

FareShare's conversational interface delivered via WhatsApp, replacing the planned web chat UI. Users message a WhatsApp number to search rides, claim seats, post rides, and post requests -- all through natural language with structured interactive responses.

---

## Requirements (R)

| ID | Requirement | Status |
|----|-------------|--------|
| R0 | User messages FareShare on WhatsApp and gets useful ride info back | Core goal |
| R1 | All 7 agent capabilities work through chat (search rides, get details, claim seat, post ride, search requests, post request, cancel seat) | Must-have |
| R2 | Agent confirms before any mutation (claim, post, cancel) | Must-have |
| R3 | Ride results are scannable and comparable in a WhatsApp message | Must-have |
| R4 | User can act on results without retyping (tap to claim, tap to see details) | Must-have |
| R5 | Conversation is multi-turn -- agent remembers context within a session | Must-have |
| R6 | Phone number is the user's identity -- no separate signup flow | Must-have |
| R7 | Agent responds in the language the user writes in (Portuguese / English) | Must-have |
| R8 | Verbal identity is respected -- direct, no exclamation marks, community vocabulary | Must-have |
| R9 | Adding future platforms (Telegram, Discord, web) requires no agent rewrite | Nice-to-have |

---

## Constraints (WhatsApp Cloud API)

These are not requirements -- they are hard platform limits that constrain the solution space.

| Constraint | Limit |
|------------|-------|
| Interactive buttons | Max 3 per message, max 20 chars per button label |
| List messages | Max 10 items, max 24 chars per item title, max 72 chars per description |
| Message body | Max 4096 chars (text), max 1024 chars (interactive body) |
| Message editing | Not supported |
| Streaming | Not supported (Chat SDK buffers then sends) |
| Typing indicators | Not supported by Cloud API |
| Fetch message history | Not supported by Cloud API |
| 24-hour window | User must message first; bot can only respond within 24h of last user message (or use templates) |

---

## A: Chat SDK + Mastra Agent on Vercel

Single Next.js app on Vercel. Chat SDK handles WhatsApp webhook parsing, message formatting, thread state, and deduplication. Mastra handles agent logic, tools, and LLM orchestration. Supabase handles data and user profiles.

### Parts

| Part | Mechanism |
|------|-----------|
| **A1** | **Chat SDK bot instance** |
| A1.1 | `Chat` instance with `createWhatsAppAdapter()` and `createPostgresState()` using the same Supabase Postgres connection. Single `lib/bot.ts` file. |
| A1.2 | Webhook route: `app/api/webhooks/whatsapp/route.ts` handles both GET (verification) and POST (messages). One file, two exports. |
| A1.3 | All WhatsApp conversations are DMs. Every incoming message hits `onNewMention` (Chat SDK sets `isMention=true` on DMs automatically). Bot subscribes on first message, then `onSubscribedMessage` handles the rest. |
| **A2** | **Identity resolution** |
| A2.1 | `profiles` table drops the `auth.users` foreign key. Primary key becomes `id uuid` (self-generated). New column `phone text unique not null`. `display_name` starts as null, set on first interaction (agent asks "what should we call you?"). |
| A2.2 | `resolveUser(waId: string)` function: queries `profiles` by phone number. If not found, inserts a new row with phone + generated UUID, returns the profile. Called on every incoming message before passing to agent. |
| A2.3 | Thread state stores the resolved `userId` so identity lookup happens once per conversation, not per message. |
| **A3** | **Agent bridge** |
| A3.1 | `onSubscribedMessage` handler: extracts user message text, retrieves resolved userId from thread state, calls Mastra agent's `generate()` with the message text and userId in `requestContext`. |
| A3.2 | Bridge inspects `response.steps[last].toolResults` from `agent.generate()`. Uses the **last step's** tool results (not the flat `response.toolResults` array) to handle multi-tool-call generations correctly -- the last step represents what the agent concluded with. The bridge switches on `toolName` to decide WhatsApp format: `search-rides` / `search-requests` → list message, `get-ride-details` → text + buttons, mutation tools → plain text, no tool results → plain text. The agent's `response.text` is used as the conversational body. See [spike](spike-agent-response-structure.md) for the full decision tree and alternatives considered. |
| A3.3 | Conversation history: Mastra Memory (`@mastra/memory` + `@mastra/pg`) handles multi-turn context. Memory is thread-scoped using the Chat SDK thread ID as the memory thread key (format: `whatsapp:{phoneNumberId}:{userWaId}`). The bridge passes `{ memory: { thread: threadId, resource: userId } }` to `agent.generate()`. Mastra persists and retrieves conversation history automatically from Supabase Postgres. WhatsApp Cloud API cannot fetch message history, so Chat SDK's `thread.messages` / `toAiMessages()` is not viable for this adapter. |
| **A4** | **Mastra agent (revised)** |
| A4.1 | Same 7 tools from `FARESHARE_AGENT_SPEC.md`: `search-rides`, `get-ride-details`, `search-requests`, `claim-seat`, `post-ride`, `post-request`, `cancel-seat`. No changes to tool logic. |
| A4.2 | Same composable instructions architecture (`instructions/` directory with identity, passenger-flow, driver-flow, request-flow, local-knowledge). |
| A4.3 | LLM: Anthropic Claude Sonnet as the sole model. Drop Kimi K2.5 -- tool calling reliability is non-negotiable for a one-shot build, and Claude Sonnet is proven. Revisit alternative models once the system is live and stable. |
| A4.4 | Agent output contract: the agent returns plain text (Mastra `generate()`). The bridge layer (A3.2) handles all WhatsApp formatting. The agent is platform-agnostic -- it doesn't know it's talking to WhatsApp. |
| **A5** | **WhatsApp response formatting** |
| A5.1 | **Ride results** -- When the agent calls `search-rides` and returns multiple rides, the bridge formats them as a WhatsApp list message. Each ride becomes a list item: title = `"Ericeira → Lisbon"` (max 24 chars, fits), description = `"Mon 14 Apr, 16:00 · 3 seats · ~€10"` (max 72 chars, fits). Tapping an item sends a reply that the agent interprets as "tell me more about ride X". |
| A5.2 | **Ride detail** -- Single ride detail formatted as a text message with WhatsApp markdown: `*bold*` for route, `_italic_` for driver info, line breaks for structure. Up to 3 interactive buttons below: `[CLAIM SEAT]` `[MESSAGE DRIVER]` `[BACK TO RESULTS]`. |
| A5.3 | **Button taps execute tools directly -- no LLM. Applies to single-parameter actions only.** When the bridge sends a ride detail (from `get-ride-details`), it attaches a `[CLAIM SEAT]` button with the ride ID as `value`. When the user taps it, the `onAction` handler calls the `claim-seat` Mastra tool *directly* -- bypassing the agent and LLM entirely. The tool result is formatted into a static success/error template. Same pattern for `cancel-seat`. Multi-field mutations (post-ride, post-request) stay conversational -- the agent collects fields via natural language and calls the tool itself when the user confirms (see A5.4). |
| A5.4 | **Post ride / post request flow** -- Fully conversational, no button-driven confirmation. Agent asks for fields (origin, destination, date, time, seats, donation) one by one or parses them if the user provides everything at once. When all fields are collected, the agent summarizes and asks the user to confirm in natural language ("should I post this?"). User replies "yes" → agent calls `post-ride` tool → bridge sees mutation tool result → sends `response.text` as plain text. This avoids the field-storage problem: the agent holds collected fields in its conversation context (Mastra Memory) and calls the tool directly when confirmed. Same pattern for `post-request`. |
| A5.5 | **Plain text responses** -- Everything else (greetings, errors, clarifying questions, success messages) goes as plain text. WhatsApp markdown for emphasis where appropriate. |
| **A6** | **Deployment** |
| A6.1 | Single Next.js app on Vercel. The existing `fareshare/` Next.js project gets the webhook route added. Chat SDK bot instance lives in `src/lib/bot.ts`. |
| A6.2 | State adapter: `@chat-adapter/state-pg` pointing at the same Supabase Postgres. Chat SDK auto-creates its 3 tables (`chat_state_subscriptions`, `chat_state_locks`, `chat_state_cache`). No Redis needed. |
| A6.3 | Environment variables added: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. |
| A6.4 | Meta app setup: WhatsApp Business app on developers.facebook.com, webhook URL pointing to `https://{domain}/api/webhooks/whatsapp`, system user token for production. |
| **A7** | **Button action handlers (direct tool execution, no LLM)** |
| A7.1 | `onAction('claim-seat')`: receives `event.value` (ride ID). Resolves user from thread state. Calls `claimSeat.execute({ rideId, userId })` directly -- no agent, no LLM. Formats tool result into static template: success → "Seat claimed. {driver}, {route}, {date} {time}." / error → "Could not claim seat. {reason}". |
| A7.2 | `onAction('back')`: static response "What are you looking for?" No agent call, no tool call. |
| A7.3 | List item selection: when user taps a ride from search results, Chat SDK delivers it as an interactive reply with the item ID. Handler calls `getRideDetails.execute({ rideId: itemId })` directly -- no agent. Bridge formats the structured tool result as text + buttons. |
| A7.4 | `onAction('cancel-seat')`: same direct-execution pattern as A7.1. Calls `cancelSeat.execute({ rideId, userId })`. Static success/error template. |

---

## Fit Check: R x A

| Req | Requirement | Status | A |
|-----|-------------|--------|---|
| R0 | User messages FareShare on WhatsApp and gets useful ride info back | Core goal | ✅ |
| R1 | All 7 agent capabilities work through chat | Must-have | ✅ |
| R2 | Agent confirms before any mutation | Must-have | ✅ |
| R3 | Ride results are scannable and comparable | Must-have | ✅ |
| R4 | User can act on results without retyping | Must-have | ✅ |
| R5 | Conversation is multi-turn | Must-have | ✅ |
| R6 | Phone number is the user's identity | Must-have | ✅ |
| R7 | Bilingual (PT/EN) | Must-have | ✅ |
| R8 | Verbal identity respected | Must-have | ✅ |
| R9 | Future platforms need no agent rewrite | Nice-to-have | ✅ |

**Notes:**

- R1 via A4.1: all 7 tools unchanged
- R2 via A5.3 + A7: mutations happen via button taps that execute tools directly (no LLM). User sees ride detail with [CLAIM SEAT] button, taps it, tool executes, static confirmation sent. See [spike](spike-agent-response-structure.md).
- R3 via A5.1: WhatsApp list messages with structured ride summaries (title + description per item, max 10 items)
- R4 via A5.1/A5.2/A7: list item taps execute `get-ride-details` directly, buttons execute mutation tools directly -- user never types a ride ID, and actions don't require LLM round-trips.
- R5 via A3.3: Mastra Memory persists conversation history in Supabase Postgres, scoped to Chat SDK thread ID. Agent retrieves context automatically on each turn.
- R9 via A4.4: agent is platform-agnostic (returns plain text + tool results), bridge layer (A3/A5/A7) is the only platform-specific code. Adding Telegram = new adapter + new bridge formatter, zero agent changes.

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────┐
│                      Vercel                           │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │          Next.js App (fareshare/)               │  │
│  │                                                  │  │
│  │  app/api/webhooks/whatsapp/route.ts              │  │
│  │       │                                          │  │
│  │       ▼                                          │  │
│  │  src/lib/bot.ts (Chat SDK)                       │  │
│  │       │                                          │  │
│  │       ├── onNewMention → subscribe + resolve     │  │
│  │       │                                          │  │
│  │       ├── onSubscribedMessage (conversational)   │  │
│  │       │        │                                 │  │
│  │       │        ▼                                 │  │
│  │       │   bridge.callAgent()                     │  │
│  │       │        │                                 │  │
│  │       │        ▼                                 │  │
│  │       │   agent.generate(msg, { memory })        │  │
│  │       │        │          ↕                      │  │
│  │       │        │    Mastra Memory                │  │
│  │       │        │    (thread-scoped,              │  │
│  │       │        │     Supabase PG)                │  │
│  │       │        ▼                                 │  │
│  │       │   bridge.formatResponse()                │  │
│  │       │   (switch on last step's toolName)       │  │
│  │       │        │                                 │  │
│  │       │        ▼                                 │  │
│  │       │   list / text+buttons / plain text       │  │
│  │       │                                          │  │
│  │       └── onAction (deterministic, no LLM)       │  │
│  │                │                                 │  │
│  │                ▼                                 │  │
│  │           tool.execute() directly                │  │
│  │                │                                 │  │
│  │                ▼                                 │  │
│  │           static template response               │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐     ┌──────────────────────────┐
│  Supabase        │     │  WhatsApp Cloud API      │
│  Postgres        │     │  (Meta)                  │
│                  │     │                          │
│  profiles        │     │  Webhook → Vercel        │
│  rides           │     │  Vercel → Send message   │
│  seats           │     │                          │
│  requests        │     └──────────────────────────┘
│  mastra_memory   │
│  chat_state_*    │
│                  │
└──────────────────┘
```

---

## Schema Changes

The existing `FARESHARE_PROJECT_PLAN.md` schema needs one modification:

```sql
-- BEFORE (current spec)
create table public.profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  created_at timestamptz default now()
);

-- AFTER (WhatsApp-first)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  display_name text,          -- nullable; set after first interaction
  created_at timestamptz default now()
);
```

**What changed:**
- Dropped `references auth.users` -- no Supabase Auth, phone number is identity
- Added `phone text unique not null` -- the WhatsApp user's phone number (international format, e.g. `351912345678`)
- `display_name` becomes nullable -- we don't know the user's name until they tell us

RLS policies simplify: no `auth.uid()` checks. The agent uses `service_role` key (bypasses RLS). Public read access stays for rides/requests. Mutation policies enforce `driver_id`/`passenger_id`/`requester_id` matching at the application layer (agent tools verify userId from requestContext before writing).

---

## WhatsApp Message Examples

### Ride search results (list message)

```
Header: RIDES FOUND
Body: 3 rides match Ericeira → Lisbon on Monday

[SELECT A RIDE ▾]
  ┌─────────────────────────────────┐
  │ Ericeira → Lisbon               │  ← item title (24 char max)
  │ Mon 14 Apr, 16:00 · 3 seats    │  ← description (72 char max)
  ├─────────────────────────────────┤
  │ Ericeira → Lisbon               │
  │ Mon 14 Apr, 18:30 · 1 seat     │
  ├─────────────────────────────────┤
  │ Ericeira → Lisbon               │
  │ Mon 14 Apr, 20:00 · 4 seats    │
  └─────────────────────────────────┘
```

When titles are identical (same route), prefix with driver name: `"Sara M · 16:00"`.

### Ride detail (text + buttons)

```
*ERICEIRA → LISBON*
_Sara M_ · 12 rides shared

Mon 14 Apr · 16:00
3 of 4 seats available
~€10 suggested donation

Sara's note: "Leaving from the main square,
can pick up anywhere along the N247"

[CLAIM SEAT]  [BACK]
```

### Claim seat (static template after button tap)

```
User taps [CLAIM SEAT] on ride detail
         ↓
Tool executes directly (no LLM)
         ↓
Seat claimed.
Sara M · Ericeira → Lisbon
Mon 14 Apr, 16:00
~€10 donation suggested
```

Error case:

```
Could not claim seat.
This ride is full.
```

### Post ride (fully conversational, agent calls tool)

```
User: I'm driving to Lisbon tomorrow at 4pm, 3 seats

Agent: Got it. Let me confirm:

*Ericeira → Lisbon*
Tue 15 Apr · 16:00
3 seats · no donation set

Want to add a suggested donation, or post as is?

User: post it, 8 euros

Agent: Ride posted.
Ericeira → Lisbon · Tue 15 Apr, 16:00
3 seats · ~€8 suggested donation
```

---

## File Map

What a coding agent needs to create, and in what order:

```
fareshare/
├── src/
│   ├── lib/
│   │   ├── bot.ts                          # Chat SDK instance + event handlers
│   │   │                                   #   onNewMention, onSubscribedMessage,
│   │   │                                   #   onAction('claim-seat'), onAction('back'),
│   │   │                                   #   onAction('cancel-seat'), list item handler
│   │   ├── bridge.ts                       # Agent call + response formatting
│   │   │                                   #   resolveUser(), callAgent(),
│   │   │                                   #   formatResponse() (switch on toolName)
│   │   └── supabase.ts                     # Supabase client (service_role)
│   ├── mastra/
│   │   ├── index.ts                        # Mastra instance
│   │   ├── agents/
│   │   │   └── fareshare-agent.ts          # Agent definition (Claude Sonnet)
│   │   ├── instructions/
│   │   │   ├── index.ts                    # Compose all sections
│   │   │   ├── identity.ts                 # Persona, tone (from VERBAL_IDENTITY.md)
│   │   │   ├── passenger-flow.ts           # Search, compare, claim
│   │   │   ├── driver-flow.ts              # Post, manage rides
│   │   │   ├── request-flow.ts             # Post, browse requests
│   │   │   └── local-knowledge.ts          # Ericeira corridor geography
│   │   └── tools/
│   │       ├── rides.ts                    # search-rides, get-ride-details, post-ride
│   │       ├── seats.ts                    # claim-seat, cancel-seat
│   │       └── requests.ts                 # search-requests, post-request
│   └── app/
│       └── api/
│           └── webhooks/
│               └── whatsapp/
│                   └── route.ts            # GET + POST webhook handler
├── .env.example
└── package.json                            # Add: chat, @chat-adapter/whatsapp,
                                            #       @chat-adapter/state-pg,
                                            #       @mastra/core, @mastra/memory,
                                            #       @mastra/pg, @supabase/supabase-js,
                                            #       zod, pg
```

### Dependency Order

| Step | Deliverable | Depends on |
|------|-------------|------------|
| 1 | Supabase project + schema (revised profiles table) + seed data | -- |
| 2 | `supabase.ts` -- Supabase client | 1 |
| 3 | `bot.ts` -- Chat SDK instance with WhatsApp adapter + PG state | 2 |
| 4 | `route.ts` -- webhook handler | 3 |
| 5 | Instructions (`instructions/*.ts`) | -- |
| 6 | Tools (`tools/*.ts`) | 2 |
| 7 | Agent definition (`fareshare-agent.ts`) | 5, 6 |
| 8 | Mastra instance (`mastra/index.ts`) | 7 |
| 9 | Identity resolution (`resolveUser` in bridge or supabase) | 2 |
| 10 | Bridge (`bridge.ts`) -- agent call + response formatting | 7, 8, 9 |
| 11 | Wire bot handlers to bridge | 3, 4, 10 |

Steps 1-4 (infra) and 5-8 (agent) can run in parallel. Step 9-11 is the integration.

---

## Environment Variables

```bash
# WhatsApp (from Meta Developer Dashboard)
WHATSAPP_ACCESS_TOKEN=             # System user token (permanent)
WHATSAPP_APP_SECRET=               # App Settings > Basic
WHATSAPP_PHONE_NUMBER_ID=          # WhatsApp > API Setup
WHATSAPP_VERIFY_TOKEN=             # User-defined secret for webhook verification

# Supabase
SUPABASE_URL=                      # Project URL
SUPABASE_SERVICE_ROLE_KEY=         # service_role key (bypasses RLS)
POSTGRES_URL=                      # Direct Postgres connection for Chat SDK state-pg

# LLM
ANTHROPIC_API_KEY=                 # Claude Sonnet
```

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Chat SDK over raw WhatsApp Cloud API | Abstracts webhook verification, message formatting, dedup, state. Future platforms (Telegram, Discord) = new adapter, no rewrite. |
| `state-pg` over Redis | Already have Supabase Postgres. One fewer dependency. Chat SDK auto-creates its tables. |
| Drop Kimi K2.5, use Claude Sonnet only | Tool calling reliability is non-negotiable for a one-shot build. Kimi was speculative. Claude Sonnet is proven. |
| ~~Drop Mastra Memory~~ → **Use Mastra Memory** | WhatsApp Cloud API cannot fetch message history, so Chat SDK's `thread.messages` / `toAiMessages()` is not viable. Mastra Memory (`@mastra/memory` + `@mastra/pg`) provides thread-scoped persistence in the same Supabase Postgres. Both packages were already in the existing agent spec. |
| Agent returns plain text, bridge formats for WhatsApp | Keeps agent platform-agnostic (R9). Bridge is the only platform-specific code. |
| Phone number = identity, no auth.users | WhatsApp provides the phone number inherently. No separate signup needed. |
| `display_name` nullable | We learn the user's name during conversation, not upfront. |
| List messages for ride results | Up to 10 items with title + description. Better than dumping text walls. Tappable. |
| Interactive buttons for confirmations/actions | Max 3 buttons, max 20 chars. Enough for CONFIRM/CANCEL and CLAIM/BACK patterns. |
| Bridge switches on `toolName` from `response.steps[last].toolResults` | Deterministic, zero extra LLM calls, uses data Mastra already provides. Last step's results handle multi-tool-call generations. Three alternatives evaluated in [spike](spike-agent-response-structure.md). |
| Button taps execute tools directly, no LLM | Single-parameter actions only (claim-seat, cancel-seat, view detail). Deterministic, fast, no LLM ambiguity. Multi-field mutations (post-ride, post-request) stay conversational -- the agent collects fields across turns and calls the tool when the user confirms in natural language. This avoids the field-storage problem between agent collection and button tap. |
| Skip Mastra Workflows / Skills / Workspaces for V1 | Workflows would add a second state orchestration layer alongside Chat SDK thread state. The agent handles multi-turn field collection well via natural language -- rigid step sequencing fights the conversational advantage. Skills are just an organizational pattern the instruction files already follow. Workspaces are for multi-agent coordination; FareShare has one agent. Revisit when adding a second agent or strict validation flows. |

---

## Open Questions

| # | Question | Impact |
|---|----------|--------|
| ~~1~~ | ~~How does the bridge know the response type?~~ **Resolved** -- bridge inspects `response.toolResults[].toolName`. Confirmations are button-driven via `onAction`. See [spike](spike-agent-response-structure.md). | -- |
| 2 | Should the agent handle the 24-hour messaging window? If a user hasn't messaged in >24h, the bot can only send template messages. For V1, this likely doesn't matter (user always initiates). But notifications ("your ride is in 1 hour") would need templates. | Future concern, not blocking. |
| 3 | WhatsApp list item titles are max 24 chars. Route like "Ericeira → Lisbon" is 18 chars (fine). But if we add driver name prefix for disambiguation, "Sara M · 16:00" = 14 chars which fits, but longer names could truncate. Need a truncation strategy. | Affects A5.1 formatting logic. |
